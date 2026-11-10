"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import styles from "./reception-form.module.css";

type Step = "type" | "establishment" | "interests" | "contact" | "details" | "review";
type Answers = {
  type: string;
  establishment: string;
  city: string;
  interests: string[];
  name: string;
  email: string;
  phone: string;
  message: string;
};

const establishmentTypes = ["Restaurant", "Hôtel", "Bar", "Pâtisserie", "Spa", "Autre"];
const interests = ["Découvrir les crus", "Organiser une dégustation", "Recevoir le book", "Parler d’un projet"];
const stages = ["Votre lieu", "Votre envie", "Vous", "Votre demande"];
const stageByStep: Record<Step, number> = { type: 0, establishment: 0, interests: 1, contact: 2, details: 3, review: 3 };
const titles: Record<Step, string> = {
  type: "Quel lieu représentez-vous ?",
  establishment: "Parlez-nous de votre lieu.",
  interests: "Qu’aimeriez-vous imaginer avec SÖRNA ?",
  contact: "À qui pouvons-nous répondre ?",
  details: "Un détail à ajouter ?",
  review: "Votre demande.",
};

export default function ReceptionForm({ introduction }: { introduction: ReactNode }) {
  const [step, setStep] = useState<Step>("type");
  const [answers, setAnswers] = useState<Answers>({ type: "", establishment: "", city: "", interests: [], name: "", email: "", phone: "", message: "" });
  const [editing, setEditing] = useState(false);
  const [interestError, setInterestError] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [instant, setInstant] = useState(true);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const keyboardRef = useRef(false);
  const interactedRef = useRef(false);
  const editingSnapshotRef = useRef<Answers | null>(null);
  const stage = stageByStep[step];

  useEffect(() => {
    if (interactedRef.current) questionRef.current?.focus({ preventScroll: true });
  }, [step]);

  function update(field: Exclude<keyof Answers, "interests">, value: string) {
    setAnswers(current => ({ ...current, [field]: value }));
    setPrepared(false);
  }

  function moveTo(next: Step) {
    interactedRef.current = true;
    setInstant(keyboardRef.current);
    setInterestError(false);
    setStep(next);
    setPrepared(false);
  }

  function edit(next: Step) {
    editingSnapshotRef.current = answers;
    setEditing(true);
    moveTo(next);
  }

  function continueForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "interests" && answers.interests.length === 0) {
      setInterestError(true);
      formRef.current?.querySelector<HTMLInputElement>('input[name="interest"]')?.focus({ preventScroll: true });
      return;
    }
    if (editing) {
      editingSnapshotRef.current = null;
      setEditing(false);
      moveTo("review");
    } else if (step === "establishment") moveTo("interests");
    else if (step === "interests") moveTo("contact");
    else if (step === "contact") moveTo("review");
  }

  function goBack() {
    if (editing) {
      if (editingSnapshotRef.current) setAnswers(editingSnapshotRef.current);
      editingSnapshotRef.current = null;
      setEditing(false);
      moveTo("review");
      return;
    }
    const previous: Partial<Record<Step, Step>> = { establishment: "type", interests: "establishment", contact: "interests", details: "review", review: "contact" };
    const destination = previous[step];
    if (destination) moveTo(destination);
  }

  const emailBody = [
    "Demande professionnelle — SÖRNA",
    "",
    `Établissement : ${answers.establishment}`,
    `Type : ${answers.type}`,
    `Ville : ${answers.city}`,
    `Envies : ${answers.interests.join(", ")}`,
    "",
    `Nom et prénom : ${answers.name}`,
    `E-mail : ${answers.email}`,
    ...(answers.phone.trim() ? [`Téléphone : ${answers.phone}`] : []),
    ...(answers.message.trim() ? ["", `Un détail à ajouter : ${answers.message}`] : []),
  ].join("\n");
  const emailHref = `mailto:contact@sorna.fr?subject=${encodeURIComponent("Votre demande professionnelle SÖRNA")}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className={styles.layout}>
      <div className={styles.editorial}>
        {introduction}
        <ol className={styles.progress} aria-label="Les étapes de votre demande">
          {stages.map((label, index) => <li key={label} data-active={index === stage} data-complete={index < stage} aria-current={index === stage ? "step" : undefined}>
            <span className={styles.stageNumber}>0{index + 1}</span><span>{label}</span>
          </li>)}
        </ol>
        <a className={styles.email} href="mailto:contact@sorna.fr">Vous préférez nous écrire ?</a>
      </div>
    <form ref={formRef} className={styles.form} onSubmit={continueForm}
      onKeyDownCapture={() => { keyboardRef.current = true; }}
      onPointerDownCapture={() => { keyboardRef.current = false; }}>
      <div key={step} className={styles.step} data-instant={instant}>
        <p className={styles.stepLabel}>{step === "review" || step === "details" ? "Un dernier regard" : `0${stage + 1} — ${stages[stage]}`}</p>
        <h3 ref={questionRef} tabIndex={-1} className={styles.question}>{titles[step]}</h3>

        {step === "type" && <>
          <p className={styles.hint}>Commençons par votre établissement.</p>
          <div className={styles.choices} role="group" aria-label="Type d’établissement">
            {establishmentTypes.map(type => <button key={type} type="button" className={styles.choice} aria-pressed={answers.type === type}
              onClick={() => { update("type", type); moveTo("establishment"); }}>
              {type}<span aria-hidden="true">→</span>
            </button>)}
          </div>
        </>}

        {step === "establishment" && <>
          <p className={styles.hint}>{answers.type} <span aria-hidden="true">·</span> <button type="button" className={styles.textButton} onClick={() => moveTo("type")}>Changer le type</button></p>
          <div className={styles.fields}>
            <label>Nom de l’établissement<input name="establishment" autoComplete="organization" required maxLength={160} value={answers.establishment} onChange={event => update("establishment", event.target.value)} /></label>
            <label>Ville<input name="city" autoComplete="address-level2" required maxLength={160} value={answers.city} onChange={event => update("city", event.target.value)} /></label>
          </div>
        </>}

        {step === "interests" && <>
          <p className={styles.hint}>Une envie ou plusieurs, à vous de choisir.</p>
          <fieldset className={styles.choices} aria-label="Ce qui vous intéresse" aria-describedby={interestError ? "reception-interest-error" : undefined}>
            {interests.map(interest => <label key={interest} className={styles.choice}>
              <input name="interest" type="checkbox" value={interest} checked={answers.interests.includes(interest)} onChange={event => {
                const checked = event.target.checked;
                setAnswers(current => ({ ...current, interests: checked ? [...current.interests, interest] : current.interests.filter(item => item !== interest) }));
                setInterestError(false);
              }} />
              <span>{interest}</span><span className={styles.check} aria-hidden="true">✓</span>
            </label>)}
          </fieldset>
          {interestError && <p id="reception-interest-error" className={styles.error} role="alert">Choisissez au moins une envie pour continuer.</p>}
        </>}

        {step === "contact" && <>
          <p className={styles.hint}>Laissez-nous de quoi poursuivre la conversation.</p>
          <div className={styles.fields}>
            <label>Nom et prénom<input name="name" autoComplete="name" required maxLength={160} value={answers.name} onChange={event => update("name", event.target.value)} /></label>
            <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={254} value={answers.email} onChange={event => update("email", event.target.value)} /></label>
          </div>
        </>}

        {step === "details" && <>
          <p className={styles.hint}>Un projet particulier, une question… seulement si vous en avez envie.</p>
          <div className={styles.fields}>
            <label className={styles.message}>Votre précision <span className={styles.optional}>facultatif</span><textarea name="message" rows={3} maxLength={2000} value={answers.message} onChange={event => update("message", event.target.value)} /></label>
            <label>Téléphone <span className={styles.optional}>facultatif</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} value={answers.phone} onChange={event => update("phone", event.target.value)} /></label>
          </div>
        </>}

        {step === "review" && <>
          <p className={styles.hint}>Tout est là. Vous pouvez encore ajuster vos réponses.</p>
          <dl className={styles.summary}>
            <div><dt>Votre établissement<button type="button" className={styles.textButton} aria-label="Modifier votre établissement" onClick={() => edit("establishment")}>Modifier</button></dt><dd title={`${answers.establishment} · ${answers.type} · ${answers.city}`}>{answers.establishment}<br /><span>{answers.type} · {answers.city}</span></dd></div>
            <div><dt>Votre envie<button type="button" className={styles.textButton} aria-label="Modifier vos envies" onClick={() => edit("interests")}>Modifier</button></dt><dd title={answers.interests.join(" · ")}>{answers.interests.join(" · ")}</dd></div>
            <div><dt>Vos coordonnées<button type="button" className={styles.textButton} aria-label="Modifier vos coordonnées" onClick={() => edit("contact")}>Modifier</button></dt><dd title={`${answers.name} · ${answers.email}`}>{answers.name}<br /><span>{answers.email}</span></dd></div>
          </dl>
          <button type="button" className={`${styles.textButton} ${styles.addDetail}`} onClick={() => edit("details")}>{answers.message || answers.phone ? "Modifier ma précision" : "Ajouter une précision"}<span className={styles.optional}>facultatif</span><span aria-hidden="true">+</span></button>
        </>}
      </div>

      <div className={styles.footer}>
      {step !== "type" && <div className={styles.actions}>
        <button type="button" className={styles.back} onClick={goBack}><span aria-hidden="true">←</span> {editing ? "Annuler" : "Retour"}</button>
        {step === "review" ? <a href={emailHref} className={styles.continue} onClick={() => setPrepared(true)}>Envoyer ma demande <span aria-hidden="true">→</span></a> :
          <button type="submit" className={styles.continue}>{editing ? "Enregistrer" : step === "contact" ? "Voir ma demande" : "Continuer"}<span aria-hidden="true">→</span></button>}
      </div>}

      {step === "review" && <p className={styles.delivery} role={prepared ? "status" : undefined}>{prepared ? "Votre demande est prête dans votre messagerie. Il vous reste à l’envoyer." : "Votre messagerie s’ouvrira avec votre demande prête à envoyer."}</p>}
      {(step === "contact" || step === "details") && <p className={styles.privacy}>Vos coordonnées servent uniquement à vous répondre.</p>}
      </div>
    </form>
    </div>
  );
}
