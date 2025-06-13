import { spawn, type ChildProcess } from "node:child_process";
import { createClaudeCodeError } from "./claude-code-error";
import type {
	ClaudeCodeProcessOptions,
	ClaudeCodeProcessResult,
	ClaudeCodeSDKMessage,
	ClaudeCodeStreamChunk,
} from "./claude-code-types";

/**
 * Claude Code CLI process manager
 */
export class ClaudeCodeProcess {
	private process: ChildProcess | null = null;
	private readonly options: Required<ClaudeCodeProcessOptions>;

	constructor(options: ClaudeCodeProcessOptions) {
		this.options = {
			cwd: options.cwd ?? process.cwd(),
			executable: options.executable ?? "claude",
			env: { ...process.env, ...(options.env ?? {}) } as Record<string, string>,
			timeout: options.timeout ?? 300000, // 5 minutes
			outputFormat: options.outputFormat ?? "stream-json",
			args: options.args ?? [],
			verbose: options.verbose ?? false,
			prompt: options.prompt,
		};
	}

	/**
	 * Execute Claude Code with the given prompt
	 */
	async execute(): Promise<ClaudeCodeProcessResult> {
		return new Promise((resolve, reject) => {
			const args = this.buildCliArgs();
			let stdout = "";
			let stderr = "";
			const messages: ClaudeCodeSDKMessage[] = [];
			let sessionId = "";
			let totalCost = 0;
			let duration = 0;

			if (this.options.verbose) {
				console.log(`Executing: ${this.options.executable} ${args.join(" ")}`);
			}

			this.process = spawn(this.options.executable, args, {
				cwd: this.options.cwd,
				env: this.options.env,
				stdio: ["pipe", "pipe", "pipe"],
			});

			// Set up timeout
			const timeoutId = setTimeout(() => {
				if (this.process) {
					this.process.kill("SIGTERM");
					reject(
						createClaudeCodeError(
							"timeout_error",
							"Claude Code process timed out",
							{
								details: { timeout: this.options.timeout },
							},
						),
					);
				}
			}, this.options.timeout);

			// Send prompt to stdin
			if (this.process.stdin) {
				this.process.stdin.write(this.options.prompt);
				this.process.stdin.end();
			}

			// Handle stdout
			if (this.process.stdout) {
				this.process.stdout.on("data", (data: Buffer) => {
					stdout += data.toString();

					if (this.options.outputFormat === "stream-json") {
						this.parseStreamingJson(data.toString(), messages, (msg) => {
							if (msg.type === "system" && msg.subtype === "init") {
								sessionId = msg.session_id;
							} else if (msg.type === "result") {
								if ("total_cost_usd" in msg) {
									totalCost = msg.total_cost_usd;
								}
								if ("duration_ms" in msg) {
									duration = msg.duration_ms;
								}
							}
						});
					}
				});
			}

			// Handle stderr
			if (this.process.stderr) {
				this.process.stderr.on("data", (data: Buffer) => {
					stderr += data.toString();
				});
			}

			// Handle process exit
			this.process.on("close", (code) => {
				clearTimeout(timeoutId);
				this.process = null;

				if (code === 0) {
					let parsedMessages = messages;
					let finalSessionId = sessionId;

					// Parse non-streaming output if needed
					if (this.options.outputFormat !== "stream-json") {
						try {
							const result = this.parseNonStreamingOutput(stdout);
							parsedMessages = result.messages;
							finalSessionId = result.sessionId;
							totalCost = result.totalCost ?? 0;
							duration = result.duration ?? 0;
						} catch (error) {
							reject(
								createClaudeCodeError(
									"parsing_error",
									"Failed to parse Claude Code output",
									{
										details: { error, stdout, stderr },
									},
								),
							);
							return;
						}
					}

					resolve({
						messages: parsedMessages,
						sessionId: finalSessionId,
						success: true,
						exitCode: code,
						duration,
						totalCost,
					});
				} else {
					reject(
						createClaudeCodeError(
							"process_error",
							`Claude Code process failed with exit code ${code}`,
							{
								...(code !== null && { code: code.toString() }),
								details: { stdout, stderr },
							},
						),
					);
				}
			});

			this.process.on("error", (error) => {
				clearTimeout(timeoutId);
				this.process = null;
				reject(
					createClaudeCodeError(
						"process_error",
						"Failed to start Claude Code process",
						{
							details: error,
						},
					),
				);
			});
		});
	}

	/**
	 * Execute Claude Code with streaming support
	 * Returns a promise that resolves to an async generator
	 */
	executeStreaming(): Promise<
		AsyncGenerator<ClaudeCodeStreamChunk, void, unknown>
	> {
		const args = this.buildCliArgs();

		if (this.options.verbose) {
			console.log(
				`Executing streaming: ${this.options.executable} ${args.join(" ")}`,
			);
		}

		this.process = spawn(this.options.executable, args, {
			cwd: this.options.cwd,
			env: this.options.env,
			stdio: ["pipe", "pipe", "pipe"],
		});

		if (!this.process.stdout) {
			throw createClaudeCodeError(
				"process_error",
				"Failed to access Claude Code stdout",
			);
		}

		// Send prompt to stdin
		if (this.process.stdin) {
			this.process.stdin.write(this.options.prompt);
			this.process.stdin.end();
		}

		let buffer = "";
		const stdout = this.process.stdout;

		const generator = async function* (): AsyncGenerator<
			ClaudeCodeStreamChunk,
			void,
			unknown
		> {
			for await (const chunk of stdout) {
				buffer += chunk.toString();
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? ""; // Keep the incomplete line in buffer

				for (const line of lines) {
					if (line.trim()) {
						try {
							const message: ClaudeCodeSDKMessage = JSON.parse(line);
							const isDone = message.type === "result";

							yield {
								data: message,
								done: isDone,
							};

							if (isDone) {
								return;
							}
						} catch (error) {
							console.warn("Failed to parse streaming JSON:", line, error);
						}
					}
				}
			}
		};

		return Promise.resolve(generator());
	}

	/**
	 * Kill the running process
	 */
	kill(): void {
		if (this.process) {
			this.process.kill("SIGTERM");
			this.process = null;
		}
	}

	/**
	 * Build CLI arguments for Claude Code
	 */
	private buildCliArgs(): string[] {
		const args = ["-p"]; // Always use print mode for SDK integration

		// Output format
		if (this.options.outputFormat) {
			args.push("--output-format", this.options.outputFormat);
		}

		// Custom arguments
		args.push(...this.options.args);

		return args;
	}

	/**
	 * Parse streaming JSON output
	 */
	private parseStreamingJson(
		data: string,
		messages: ClaudeCodeSDKMessage[],
		onMessage?: (message: ClaudeCodeSDKMessage) => void,
	): void {
		const lines = data.split("\n");
		for (const line of lines) {
			if (line.trim()) {
				try {
					const message: ClaudeCodeSDKMessage = JSON.parse(line);
					messages.push(message);
					onMessage?.(message);
				} catch (error) {
					if (this.options.verbose) {
						console.warn("Failed to parse streaming JSON line:", line, error);
					}
				}
			}
		}
	}

	/**
	 * Parse non-streaming output (JSON or text)
	 */
	private parseNonStreamingOutput(output: string): {
		messages: ClaudeCodeSDKMessage[];
		sessionId: string;
		totalCost?: number;
		duration?: number;
	} {
		if (this.options.outputFormat === "json") {
			try {
				const result = JSON.parse(output);
				return {
					messages: [
						{
							type: "result",
							subtype: "success",
							result: result.result,
							session_id: result.session_id,
							duration_ms: result.duration_ms,
							duration_api_ms: result.duration_api_ms,
							is_error: result.is_error,
							num_turns: result.num_turns,
							total_cost_usd: result.total_cost_usd,
						},
					],
					sessionId: result.session_id,
					totalCost: result.total_cost_usd,
					duration: result.duration_ms,
				};
			} catch (error) {
				throw createClaudeCodeError(
					"parsing_error",
					"Failed to parse JSON output",
					{
						details: { error, output },
					},
				);
			}
		} else {
			// Text format - create a mock result
			return {
				messages: [
					{
						type: "result",
						subtype: "success",
						result: output,
						session_id: "",
						duration_ms: 0,
						duration_api_ms: 0,
						is_error: false,
						num_turns: 1,
						total_cost_usd: 0,
					},
				],
				sessionId: "",
			};
		}
	}
}
