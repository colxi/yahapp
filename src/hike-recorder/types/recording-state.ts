import type { Hike } from '@/hike-storage/types/hike';

export interface RecordingState {
  hike: Hike | null;
}

export const INITIAL_RECORDING_STATE: RecordingState = {
  hike: null,
};
