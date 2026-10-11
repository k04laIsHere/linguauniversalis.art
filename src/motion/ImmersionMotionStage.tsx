"use client";

import { forwardRef } from "react";
import {
  SequenceCanvas,
  type SequenceCanvasHandle,
  type SequenceCanvasProps,
} from "./SequenceCanvas";
import styles from "./ImmersionMotionStage.module.css";

export type ImmersionMotionStageProps = Omit<SequenceCanvasProps, "className"> & {
  className?: string;
};

export const ImmersionMotionStage = forwardRef<
  SequenceCanvasHandle,
  ImmersionMotionStageProps
>(function ImmersionMotionStage({ className, ...props }, ref) {
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <div className={rootClassName} aria-hidden="true">
      <SequenceCanvas ref={ref} {...props} className={styles.canvas} />
    </div>
  );
});

