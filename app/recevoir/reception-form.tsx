"use client";

import { useState, type FormEvent } from "react";
import styles from "./recevoir.module.css";

export default function ReceptionForm() {
  const [prepared, setPrepared] = useState(false);
  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = Array.from(data.entries()).map(([key, value]) => `${key} : ${String(value)}`);
    window.location.href = `mailto:contact@sorna.fr?subject=${encodeURIComponent("Votre demande de dégustation SÖRNA")}&body=${encodeURIComponent(lines.join("\n"))}`;
    setPrepared(true);
  }
  return <form className={styles.form} onSubmit={prepareEmail}>
    <p className={styles.formNote}>Les champs marqués d’un * sont obligatoires.</p>
    <div className={styles.fields}>
      <label>Établissement *<input name="Établissement" autoComplete="organization" required maxLength={160} /></label>
      <label>Nom et prénom *<input name="Nom et prénom" autoComplete="name" required maxLength={160} /></label>
      <label>E-mail *<input name="E-mail" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>Téléphone *<input name="Téléphone" type="tel" autoComplete="tel" required maxLength={40} /></label>
      <label>Type d’établissement<select name="Type d’établissement" defaultValue=""><option value="">Sélectionner</option>{["Restaurant", "Pâtisserie", "Bar", "Hôtel", "Spa", "Autre"].map(type => <option key={type}>{type}</option>)}</select></label>
      <label>Ville<input name="Ville" autoComplete="address-level2" maxLength={160} /></label>
      <label>Fonction<input name="Fonction" autoComplete="organization-title" maxLength={160} /></label>
      <label>Couverts par service ou chambres<input name="Couverts par service ou chambres" type="number" min="0" max="100000" /></label>
    </div>
    <fieldset className={styles.interests}><legend>Ce qui vous intéresse</legend>{["Cinq Sommets", "Thé en chambre", "Infusion à froid", "Soins (2027)"].map(item => <label key={item}><input type="checkbox" name="Intérêt" value={item} />{item}</label>)}</fieldset>
    <label className={styles.message}>Votre message<textarea name="Message" rows={3} maxLength={4000} /></label>
    <button type="submit" className={styles.button}>Préparer ma demande par e-mail <span aria-hidden="true">↗</span></button>
    <p className={styles.formNote}>Votre messagerie s’ouvrira avec votre demande à envoyer à contact@sorna.fr.</p>
    <p className={styles.privacy}>Vos informations servent uniquement à répondre à votre demande. Elles ne sont ni vendues ni partagées.</p>
    <p role="status" className={styles.formNote}>{prepared ? "Votre demande a été préparée. Envoyez-la depuis votre messagerie. Si elle ne s’ouvre pas, contactez-nous à contact@sorna.fr." : ""}</p>
  </form>;
}
