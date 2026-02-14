interface CheckpointProps {
  question: string;
  options: string[];
  onChoose: (value: string) => void;
}

export function Checkpoint({ question, options, onChoose }: CheckpointProps) {
  return (
    <section className="card">
      <h3>{question}</h3>
      <div className="stack">
        {options.map((option) => (
          <button className="ghost-button" key={option} onClick={() => onChoose(option)}>
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
