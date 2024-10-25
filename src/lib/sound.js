import * as Tone from "tone";

export const harpSampler = new Tone.Sampler({
    urls: {
        C4: "Harp-C4.mp3",
    },
    baseUrl: "/audio/",
    onload: () => {
    }
});

export const drumSampler = new Tone.Sampler({
    urls: {
        C4: "kick.mp3",
        D4: "snare.mp3",
        E4: "woodblock.mp3"
    },
    baseUrl: "/audio/",
    onload: () => {
    }
}).toDestination();

drumSampler.set({
  volume: -12
});

const reverb = new Tone.Reverb({
  decay: 3,
  predelay: 0,
  wet: 0.5
}).toDestination();

harpSampler.connect(reverb);

harpSampler.set({
  release: 8,
  volume: -12
});


Tone.BaseContext.lookAhead = 0.5;

export const myTransport = Tone.getTransport();

export const startSound = () => {
    Tone.start();
}