/**
 * Claude Code SDK Message Types
 * Based on the Claude Code SDK documentation
 */

// Anthropic SDK types - using generic Record for now
// In a real implementation, you would import the actual types from the SDK
type Message = Record<string, unknown>;
type MessageParam = Record<string, unknown>;

/**
 * Claude Code SDK Message types
 */
export type ClaudeCodeSDKMessage =
	// Assistant message
	| {
			type: "assistant";
			message: Message;
			session_id: string;
	  }
	// User message
	| {
			type: "user";
			message: MessageParam;
			session_id: string;
	  }
	// Success result message (last message)
	| {
			type: "result";
			subtype: "success";
			duration_ms: number;
			duration_api_ms: number;
			is_error: boolean;
			num_turns: number;
			result: string;
			session_id: string;
			total_cost_usd: number;
	  }
	// Error result messages
	| {
			type: "result";
			subtype: "error_max_turns" | "error_during_execution";
			duration_ms: number;
			duration_api_ms: number;
			is_error: boolean;
			num_turns: number;
			session_id: string;
			total_cost_usd: number;
	  }
	// Initialization message (first message)
	| {
			type: "system";
			subtype: "init";
			apiKeySource: string;
			cwd: string;
			session_id: string;
			tools: string[];
			mcp_servers: Array<{
				name: string;
				status: string;
			}>;
			model: string;
			permissionMode: "default" | "acceptEdits" | "bypassPermissions" | "plan";
	  };

/**
 * Claude Code process execution options
 */
export interface ClaudeCodeProcessOptions {
	/**
	 * The prompt to send to Claude Code
	 */
	prompt: string;

	/**
	 * Working directory for execution
	 */
	cwd?: string;

	/**
	 * Path to Claude Code executable
	 */
	executable?: string;

	/**
	 * Environment variables
	 */
	env?: Record<string, string>;

	/**
	 * Timeout in milliseconds
	 */
	timeout?: number;

	/**
	 * Output format
	 */
	outputFormat?: "text" | "json" | "stream-json";

	/**
	 * Additional CLI arguments
	 */
	args?: string[];

	/**
	 * Whether to enable verbose logging
	 */
	verbose?: boolean;
}

/**
 * Claude Code streaming chunk data
 */
export interface ClaudeCodeStreamChunk {
	data: ClaudeCodeSDKMessage;
	done: boolean;
}

/**
 * Claude Code process result
 */
export interface ClaudeCodeProcessResult {
	messages: ClaudeCodeSDKMessage[];
	sessionId: string;
	success: boolean;
	error?: string;
	exitCode?: number;
	duration?: number;
	totalCost?: number;
}

/**
 * Claude Code tool call result
 */
export interface ClaudeCodeToolCall {
	id: string;
	name: string;
	arguments: string;
	result?: string;
}
