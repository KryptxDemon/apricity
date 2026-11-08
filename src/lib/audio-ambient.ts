// Web Audio ambient sound engine
// Generates rain, library, night breeze, and warm café murmur without external files.

export type AmbientSoundType = "none" | "rain" | "library" | "night" | "cafe";

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = "none";
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private volume: number = 0.35;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume * 0.18, this.ctx.currentTime);
    }
  }

  public play(type: AmbientSoundType) {
    if (type === "none") {
      this.stop();
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    this.stop();
    this.currentType = type;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === "rain") {
          lastOut = (lastOut + 0.03 * white) / 1.03;
          output[i] = lastOut * 3.5;
        } else if (type === "library") {
          lastOut = (lastOut + 0.015 * white) / 1.015;
          output[i] = lastOut * 2.6;
        } else if (type === "cafe") {
          lastOut = (lastOut + 0.022 * white) / 1.022;
          output[i] = lastOut * 3.0;
        } else {
          lastOut = (lastOut + 0.018 * white) / 1.018;
          output[i] = lastOut * 2.4;
        }
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      if (type === "rain") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      } else if (type === "library") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.Q.setValueAtTime(0.8, this.ctx.currentTime);
      } else if (type === "cafe") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(550, this.ctx.currentTime);
        filter.Q.setValueAtTime(0.6, this.ctx.currentTime);
      } else {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      }

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume * 0.18, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      whiteNoise.start(0);
      this.noiseNode = whiteNoise;
    } catch {
      // autoplay policy handled
    }
  }

  public stop() {
    this.currentType = "none";
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // safe
      }
      this.noiseNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }
}

export const ambientSound = new AmbientSoundEngine();
