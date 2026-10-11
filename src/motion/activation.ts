export type ProgressDelivery = "delivered" | "deferred";

/**
 * Prevents progress intended for a newly requested sequence from reaching the
 * imperative handle that still belongs to the previously committed sequence.
 */
export function commitOrDeferSequenceProgress(
  activeSequenceId: string,
  requestedSequenceId: string,
  onSequenceChange: () => void,
  onCommittedProgress: () => void,
): ProgressDelivery {
  if (activeSequenceId !== requestedSequenceId) {
    onSequenceChange();
    return "deferred";
  }
  onCommittedProgress();
  return "delivered";
}
