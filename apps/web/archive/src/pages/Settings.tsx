import { FormEvent, useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import { api } from "../lib/api";
import { useAppState } from "../lib/appState";
import type { Pace, Translation } from "../lib/types";

export default function Settings() {
  const { bootstrap, refresh } = useAppState();
  const [translation, setTranslation] = useState<Translation>(bootstrap?.settings.translation ?? "WEB");
  const [pace, setPace] = useState<Pace>(bootstrap?.settings.pace ?? "standard");
  const [reminderTime, setReminderTime] = useState(bootstrap?.settings.reminderTime ?? "07:30");
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api.saveSettings({ translation, pace, reminderTime });
    await refresh();
    setStatus("Saved");
  }

  return (
    <section className="stack">
      <h1>Settings</h1>
      <form className="card stack" onSubmit={submit}>
        <label>
          Translation
          <select value={translation} onChange={(event) => setTranslation(event.target.value as Translation)}>
            {(bootstrap?.supportedTranslations ?? ["WEB", "KJV", "ASV", "BBE", "DARBY"]).map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Pace
          <select value={pace} onChange={(event) => setPace(event.target.value as Pace)}>
            <option value="short">Short</option>
            <option value="standard">Standard</option>
          </select>
        </label>
        <label>
          Reminder time
          <input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
        </label>
        <p className="caption">More translations coming as licensing allows.</p>
        <PrimaryButton type="submit">Save settings</PrimaryButton>
      </form>
      {status && <p className="caption">{status}</p>}
    </section>
  );
}
