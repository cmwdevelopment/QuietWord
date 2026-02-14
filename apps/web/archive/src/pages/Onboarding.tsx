import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../components/PrimaryButton";
import { api } from "../lib/api";
import { useAppState } from "../lib/appState";
import type { Pace, Translation } from "../lib/types";

export default function Onboarding() {
  const { bootstrap, refresh } = useAppState();
  const navigate = useNavigate();
  const [translation, setTranslation] = useState<Translation>(bootstrap?.settings.translation ?? "WEB");
  const [pace, setPace] = useState<Pace>(bootstrap?.settings.pace ?? "standard");
  const [reminderTime, setReminderTime] = useState(bootstrap?.settings.reminderTime ?? "07:30");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await api.saveSettings({ translation, pace, reminderTime });
    await refresh();
    navigate("/");
  }

  return (
    <section className="stack">
      <h1>Built for busy minds.</h1>
      <p>One passage at a time.</p>
      <form onSubmit={onSubmit} className="card stack">
        <label>
          Translation
          <select value={translation} onChange={(event) => setTranslation(event.target.value as Translation)}>
            {(bootstrap?.supportedTranslations ?? ["WEB", "KJV", "ASV", "BBE", "DARBY"]).map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Reading pace
          <select value={pace} onChange={(event) => setPace(event.target.value as Pace)}>
            <option value="short">Short</option>
            <option value="standard">Standard</option>
          </select>
        </label>
        <label>
          Reminder time
          <input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
        </label>
        <p className="caption">{bootstrap?.translationMicrocopy ?? "More translations coming as licensing allows."}</p>
        <PrimaryButton type="submit">Save onboarding</PrimaryButton>
      </form>
    </section>
  );
}
