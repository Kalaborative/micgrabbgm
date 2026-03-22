declare module "soundtouchjs" {
  export class SoundTouch {
    pitchSemitones: number;
    pitch: number;
    tempo: number;
    rate: number;
    inputBuffer: FifoSampleBuffer;
    outputBuffer: FifoSampleBuffer;
    process(): void;
    clear(): void;
  }

  export class FifoSampleBuffer {
    frameCount: number;
    putSamples(samples: Float32Array, offset: number, numFrames: number): void;
    receiveSamples(output: Float32Array, numFrames: number): number;
    clear(): void;
  }

  export class WebAudioBufferSource {
    constructor(buffer: AudioBuffer);
    extract(target: Float32Array, numFrames: number, position?: number): number;
  }

  export class SimpleFilter {
    constructor(source: WebAudioBufferSource, pipe: SoundTouch);
    extract(target: Float32Array, numFrames: number): number;
  }

  export class PitchShifter {
    constructor(context: AudioContext, buffer: AudioBuffer, bufferSize: number, onEnd?: () => void);
    pitch: number;
    pitchSemitones: number;
    tempo: number;
    rate: number;
    node: ScriptProcessorNode;
    connect(node: AudioNode): void;
    disconnect(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string): void;
  }
}
