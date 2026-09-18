export interface ITTSProvider {
  id: 'elevenlabs' | 'openai' | 'browser-tts' | string;
  synthesize(
    script: string,
    voiceId: string,
    speed: number,
    outputPath?: string
  ): Promise<{ audioUrl: string; durationInSeconds: number }>;
}
