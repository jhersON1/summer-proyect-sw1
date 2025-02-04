export interface AudioTranscriptionResponse {
    text: string;
    segments: AudioSegment[];
    language: string;
}

export interface AudioSegment {
    id: number;
    start: number;
    end: number;
    text: string;
    words: Word[];
}

export interface Word {
    word: string;
    start: number;
    end: number;
    confidence: number;
}