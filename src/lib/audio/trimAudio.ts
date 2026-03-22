export async function trimAudio(
  audioUrl: string,
  startTime: number,
  endTime: number,
  semitones: number = 0
): Promise<Blob> {
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();

  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor(endTime * sampleRate);
  const trimmedLength = endSample - startSample;

  // Trim first
  const trimmedBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    trimmedLength,
    sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const sourceData = audioBuffer.getChannelData(channel);
    const trimmedData = trimmedBuffer.getChannelData(channel);
    for (let i = 0; i < trimmedLength; i++) {
      trimmedData[i] = sourceData[startSample + i];
    }
  }

  if (semitones !== 0) {
    // Pitch-shift without changing speed using SoundTouch
    const { SoundTouch, SimpleFilter, WebAudioBufferSource } = await import("soundtouchjs");

    const source = new WebAudioBufferSource(trimmedBuffer);
    const soundtouch = new SoundTouch();
    soundtouch.pitchSemitones = semitones;
    const filter = new SimpleFilter(source, soundtouch);

    const numChannels = trimmedBuffer.numberOfChannels;
    const chunks: Float32Array[] = [];
    const chunkSize = 4096;
    let totalFrames = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const buf = new Float32Array(chunkSize * 2);
      const extracted = filter.extract(buf, chunkSize);
      if (extracted === 0) break;
      chunks.push(buf.subarray(0, extracted * 2));
      totalFrames += extracted;
    }

    const outputBuffer = audioContext.createBuffer(numChannels, totalFrames, sampleRate);
    const left = outputBuffer.getChannelData(0);
    const right = numChannels > 1 ? outputBuffer.getChannelData(1) : null;

    let frameIdx = 0;
    for (const chunk of chunks) {
      for (let i = 0; i < chunk.length; i += 2) {
        left[frameIdx] = chunk[i];
        if (right) right[frameIdx] = chunk[i + 1];
        frameIdx++;
      }
    }

    const wavBlob = encodeWAV(outputBuffer);
    audioContext.close();
    return wavBlob;
  }

  // Fast path: no pitch shift
  const wavBlob = encodeWAV(trimmedBuffer);
  audioContext.close();
  return wavBlob;
}

function encodeWAV(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // WAV header
  writeString(0, "RIFF");
  view.setUint32(4, length - 8, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, "data");
  view.setUint32(40, length - 44, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}
