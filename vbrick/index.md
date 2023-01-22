# Datenschutzvorfall an der FU Berlin durch Fehlkonfiguration des Videostreamingdienstes vBrick

Nachdem mich Ende letzten Jahres ein\*e Kommiliton\*in auf eine Sicherheitslücke/einen Datenschutzvorfall bei vbrick an der FU Berlin hingewiesen habt habe ich diesen an die zuständigen Stellen gemeldet. Mittlerweile wurde der Fehler behoben und die Betroffenen benachrichtigt. Hier ein kurzer Einblick wie das ablief.

# Was ist passiert?
Die FU Berlin setzt seit 2021 die Videostreamingplattform "vbrick Rev" des US-Unternehmens vbrick Systems ein. Auf der Plattform finden sich hauptsächlich Aufzeichnungen von Vorlesungen und andere Lehrvideos. vbrick übernimmt dabei das hosten und stellt die Plattform als SaaS zur Verfügung.

Bei dieser Plattform gab es eine Fehlkonfiguration, sodass bei 289 Videos jede\*r, der\*die Zugang zu vbrick hat personenbezogene Daten von Dritten einsehen konnte, die dieses Video ebenfalls aufgerufen hatten. Das betraf Vor- und Nachnamen aller Nutzer\*innen, die das Video abgerufen hatten, deren FU-Email-Adresse, IP-Adresse, Browser User-Agent String und Betriebssystem. Außerdem wann der Abruf erfolgte, wie lange er andauerte und ob er vollständig war.

Möglich war das, da die Videoeinträge so konfiguriert waren, dass jede\*r sie bearbeiten konnte. Im Attribut "Access Control" war dort eingetragen "All Users". Die FU teilte mir mit, dass dies zumindest teilweise von Dozierende gewollt war, dass auch Studierende Videos bearbeiten können. In der Meldung des Datenschutzvorfalls an die Betroffenen spricht sie aber ebenfalls von einem Softwarefehler.

# Meldung an die FU
Am 29.11.2022 um 11:34 Uhr schrieb ich eine Email an den IT-Sicherheitsbeauftragten und den  Datenschutzbeauftragten der FU Berlin und schilderte das Problem. Ich erklärte, dass man alle betroffenen Videos mit der "Bulk Edit" Funktion finden konnte und, dass die Statistik Daten einsehbar waren. Zum Beweis schickte ich auch einen Screenshot von Statistikdaten.

Ich wies ebenfalls darauf hin, dass die Videos Daten sich auch als .csv herunterladen lassen, was einen potenziellen Missbrauch der Daten noch etwas einfacher machen würde.

Ich bat die Lücke zu schließen und die Meldung an die Aufsichtsbehörde, in diesem Fall die Berliner Beauftragte für Datenschutz und Informationsfreiheit (BlnBDI), zu veranlassen.
Die Meldung an die Aufsichtsbehörde ist nach Art. 33 DSGVO "unverzüglich und möglichst binnen 72 Stunden" zu erfolgen.

Am 2.12.2022 um 11:10 Uhr antwortete mir der stellvertretende Datenschutzbeauftragte und Mitarbeiter des Rechtsamts, dass der Konfigurationsfehler der 289 Videos umgehend beseitigt wurde und, dass die Zuständigkeit für die Meldung an die Aufsichtsbehörde beim Rechtsamt liege und man diese dort prüfe und veranlasse.

Am 5.12.2022 teilte man mir auf erneute Nachfrage und Hinweis auf die 72 Stunden Frist schließlich mit, dass die Meldung bereits am 2.12. erfolgt sei. Angesichts der Uhrzeit gehe ich nicht davon aus, dass die 72 Stunden eingehalten wurden. Warum das nicht möglich war erschließt sich mir nicht.

Am 11.01.2023 teilte man mir auf Nachfrage, wann denn die Benachrichtigung der Betroffenen nach Art. 34 DSGVO erfolgen wird mit, dass man wegen dieser Sache mit der BlnBDI in Verbindung stehe und diese vorbereite.

Bis hierhin hat sich niemand auf Seiten der Universität für die Meldung bedankt oder hat mir technische Details zur Lücke kommuniziert und wie diese behoben wurde. Erst am 12.01.2023 schrieb mit der IT-Sicherheitsbeauftragte, dass man sich als Universität selbstverständliche freue wenn Mitglieder oder Dritte auf Sicherheitsvorfälle hinweisen.

Er schilderte ebenfalls technische Details. Der Konfigurationsfehler entstand wohl hauptsächlich durch eine Verwirrende Darstellung wodurch beim Upload die falschen Rechte gesetzt wurden. Deswegen hat sich die FU mit dem Hersteller von vbrick in Verbindung gesetzt um die Darstellung klarer zu gestalten. Dies ist auch vor Weihnachten bereits ausgerollt worden. Screenshots des UI wären spannend, habe ich aber leider nicht vorliegen, weil ich das Uploaden von Videos vorher nicht getestet habe.
Außerdem hat die ZEDAT (Hochschulrechenzentrum der FU), die Konfiguration der Videos angepasst und prüft einmal werktäglich ob weitere Videos mit fehlerhafter Konfiguration hochgeladen werden.
Diese Überprüfung will die ZEDAT solange fortsetzen bis der Hersteller, eine Aktualisierung bereitstellt, mit der die Erhebung der Statistikdaten gänzlich deaktiviert werden kann, zur Verfügung steht.

Diese Email vom IT-Sicherheitsbeauftragten hätte ich mir deutlich früher gewünscht. Zuvor hatte ich nur Kontakt mit dem Rechtsamt, dass auf technische Details nicht einging.

# Kritik Datenerhebung
Es drängt sich natürlich die Frage auf wieso durch die Videostreamingplattform überhaupt so umfangreiche Daten erhoben werden. Besonders problematisch ist die Erhebung der Daten dadurch, dass vbrick ein US-Unternehmen ist. Hier ist die Übermittlung der Daten nach dem Schrems-II Urteil des EuGH nicht ohne Weiteres möglich.

Die FU sah anscheinend ebenfalls Probleme und stützt deshalb die Datenverarbeitung auf Einwilligung (Art. 6 Abs. 1 a) DSGVO). Hierfür muss jede\*r User beim ersten Aufrufen von vbrick eine Checkbox aktivieren und seine Einwilligung erteilen.

Im Kontext der Lehre ist Einwilligung als Grundlage für die Datenverarbeitung allerdings nicht möglich, denn wenn keine Alternative zu vbrick besteht und bei einer Ablehnung den Studierenden ein Nachteil entsteht, handelt es sich nicht um eine freiwillige Einwilligung (Art. 7 Abs. 4 DSGVO).

Ich hoffe, dass die FU die Datenerhebung einstellen wird sobald vbrick dieses Feature anbietet. Dennoch bleibt die Verarbeitung durch einen Auftragsdatenverarbeiten aus den USA problematisch. Ich werde hierzu noch die BlnBDI bitten die Verarbeitung zu überprüfen. Diese hat schon bei der Verwendung von Cisco Webex durch die FU die Verarbeitung für rechtswidrig befunden und eine Untersagung der Nutzung angedroht[^1].

# Kritik Reaktion Meldung
Auch die Reaktion auf die Meldung wäre verbesserungswürdig. Es wäre wünschenswert wenn es bei einer Organisation eine zuständige Ansprechperson gibt für Personen, die Sicherheitslücken oder Datenschutzvorfälle melden. Stattdessen habe ich einmal vom Rechtsamt und erst Monate später eine Antwort vom IT-Sicherheitsbeauftragten erhalten. Auch eine Bestätigung des Eingangs meiner Meldung und eine Versicherung, dass man sich dem Problem annimmt, habe ich nicht erhalten. Erst als die Lücke geschlossen wurde, hat man mir geantwortet.

Dass es an der FU einen IT-Sicherheitsbeauftragten gibt, wusste ich auch nur dadurch, dass ich dort studiere und mich in der akademischen Selbstverwaltung engagiere. Eine security.txt auf der Domain fu-berlin.de wurde erst auf meine Bitte hinzugefügt[^2].

Da die FU gerade im Rahmen des "FUture IT" Prozess ihre IT umorganisiert und mit dem Erstellen der security.txt schon Verbesserungen stattgefunden haben, hoffe ich, dass sich auch andere Prozesse in Zukunft verbessern.
[^1]: https://taz.de/Streit-um-Datenschutz-an-der-FU-Berlin/!5879096/
[^2]: https://chaos.social/@besendorf/109664702426465447

