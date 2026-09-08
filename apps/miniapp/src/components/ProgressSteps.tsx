import "./ProgressSteps.css";

interface ProgressStepsProps {
  total: number;
  current: number;
}

export function ProgressSteps({ total, current }: ProgressStepsProps) {
  return (
    <div className="progress-steps" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1}>
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={index <= current ? "progress-steps__segment progress-steps__segment--done" : "progress-steps__segment"} />
      ))}
    </div>
  );
}
