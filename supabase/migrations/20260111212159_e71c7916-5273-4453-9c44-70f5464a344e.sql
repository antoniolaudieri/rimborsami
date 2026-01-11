-- Add missing templates to opportunities

-- Rimborso overbooking (flight)
UPDATE opportunities 
SET template_email = 'Gentili Signori,

con la presente, il/la sottoscritto/a {{nome}}, richiede formalmente la compensazione pecuniaria per negato imbarco (overbooking) sul volo {{flight_number}} del {{flight_date}}.

Ai sensi del Regolamento (CE) n. 261/2004, art. 4, in caso di negato imbarco contro la volontà del passeggero, ho diritto a:
- Compensazione pecuniaria (€250-600 in base alla tratta)
- Rimborso del biglietto o volo alternativo
- Assistenza (pasti, bevande, eventuale pernottamento)

Dati del volo:
- Numero volo: {{flight_number}}
- Data: {{flight_date}}
- Tratta: {{departure_airport}} - {{arrival_airport}}
- Compagnia: {{airline}}

Resto in attesa di un vostro riscontro entro 30 giorni, decorsi i quali mi riservo di adire le competenti autorità (ENAC) e le vie legali.

Cordiali saluti,
{{nome}}
{{email}}',
template_pec = 'RACCOMANDATA A/R TRAMITE PEC

Data: {{data_odierna}}
Oggetto: RICHIESTA COMPENSAZIONE PECUNIARIA PER NEGATO IMBARCO - REG. CE 261/2004

Spett.le Compagnia Aerea,

il/la sottoscritto/a {{nome}}, richiede formalmente la compensazione pecuniaria per negato imbarco (overbooking) sul volo {{flight_number}} del {{flight_date}}.

Ai sensi del Regolamento (CE) n. 261/2004, art. 4, DIFFIDO E METTO IN MORA codesta Spett.le Compagnia a corrispondere entro 15 giorni:
- Compensazione pecuniaria ex art. 7 del Regolamento
- Rimborso spese accessorie sostenute

In difetto, procederò con segnalazione a ENAC e azione legale.

Cordiali saluti,
{{nome}}
{{email}}'
WHERE title ILIKE '%overbooking%';

-- Mancata consegna ordine online (ecommerce)
UPDATE opportunities 
SET template_email = 'Gentili Signori,

il/la sottoscritto/a {{nome}}, con riferimento all ordine n. {{order_number}} del {{order_date}}, comunica che ad oggi il prodotto ordinato non è stato consegnato.

Dettagli ordine:
- Numero ordine: {{order_number}}
- Data ordine: {{order_date}}
- Prodotto: {{product_name}}
- Importo pagato: €{{amount}}
- Venditore: {{seller_name}}

Ai sensi del Codice del Consumo (D.Lgs. 206/2005), art. 61, il venditore è tenuto a consegnare i beni entro il termine pattuito o, in mancanza, entro 30 giorni.

Chiedo pertanto:
1. La consegna immediata del prodotto, oppure
2. Il rimborso integrale dell importo pagato

In assenza di riscontro entro 15 giorni, procederò con segnalazione ad AGCM e azione legale.

Cordiali saluti,
{{nome}}
{{email}}',
template_pec = 'RACCOMANDATA A/R TRAMITE PEC

Data: {{data_odierna}}
Oggetto: MESSA IN MORA - MANCATA CONSEGNA ORDINE N. {{order_number}}

Spett.le {{seller_name}},

il/la sottoscritto/a {{nome}}, DIFFIDO E METTO IN MORA codesta Società per la mancata consegna dell ordine n. {{order_number}} del {{order_date}}.

Importo pagato: €{{amount}}

Ai sensi del D.Lgs. 206/2005, richiedo entro 15 giorni la consegna o il rimborso integrale.

In difetto, procederò con azione legale e segnalazione ad AGCM.

{{nome}}
{{email}}'
WHERE title ILIKE '%mancata consegna%';

-- Prodotto non conforme a descrizione (ecommerce)
UPDATE opportunities 
SET template_email = 'Gentili Signori,

il/la sottoscritto/a {{nome}}, con riferimento all ordine n. {{order_number}} del {{order_date}}, segnala che il prodotto ricevuto non è conforme alla descrizione pubblicata.

Dettagli:
- Numero ordine: {{order_number}}
- Prodotto: {{product_name}}
- Importo: €{{amount}}
- Non conformità riscontrata: {{issue_type}}

Ai sensi degli artt. 129-132 del Codice del Consumo, il venditore è responsabile per qualsiasi difetto di conformità esistente al momento della consegna.

Chiedo pertanto la sostituzione del prodotto o, in alternativa, il rimborso integrale.

Cordiali saluti,
{{nome}}
{{email}}',
template_pec = 'RACCOMANDATA A/R TRAMITE PEC

Data: {{data_odierna}}
Oggetto: RICHIESTA RIMBORSO/SOSTITUZIONE PER PRODOTTO NON CONFORME

Spett.le {{seller_name}},

il/la sottoscritto/a {{nome}}, ai sensi del Codice del Consumo, contesta la conformità del prodotto {{product_name}} (ordine {{order_number}}).

Richiedo entro 15 giorni la sostituzione o il rimborso di €{{amount}}.

{{nome}}
{{email}}'
WHERE title ILIKE '%non conforme%';

-- Rimborso doppio addebito (bank)
UPDATE opportunities 
SET template_email = 'Spett.le {{bank_name}},

il/la sottoscritto/a {{nome}}, titolare del conto corrente presso il Vostro istituto, segnala un DOPPIO ADDEBITO riscontrato in data {{period_start}}.

Dettagli:
- Tipo conto: {{account_type}}
- Periodo: dal {{period_start}} al {{period_end}}
- Importo erroneamente addebitato due volte: €{{estimated_amount}}

Ai sensi dell art. 2033 c.c. (indebito oggettivo) e della normativa bancaria vigente, chiedo la restituzione dell importo indebitamente addebitato entro 15 giorni.

In assenza di riscontro, procederò con reclamo all Arbitro Bancario Finanziario.

Cordiali saluti,
{{nome}}
{{email}}',
template_pec = 'RACCOMANDATA A/R TRAMITE PEC

Data: {{data_odierna}}
Oggetto: RICHIESTA RIMBORSO DOPPIO ADDEBITO - MESSA IN MORA

Spett.le {{bank_name}},

il/la sottoscritto/a {{nome}}, DIFFIDO E METTO IN MORA codesto Istituto per il rimborso del doppio addebito di €{{estimated_amount}} riscontrato nel periodo {{period_start}} - {{period_end}}.

Richiedo la restituzione entro 15 giorni ai sensi dell art. 2033 c.c.

In difetto, procederò con ricorso all ABF e azione legale.

{{nome}}
{{email}}'
WHERE title ILIKE '%doppio addebito%';

-- Liquidazione parziale sinistro (insurance)  
UPDATE opportunities 
SET template_email = 'Spett.le {{insurance_company}},

il/la sottoscritto/a {{nome}}, assicurato con polizza n. {{policy_number}}, contesta la liquidazione parziale del sinistro avvenuto in data {{claim_date}}.

Dettagli:
- Tipo polizza: {{policy_type}}
- Importo richiesto: €{{claim_amount}}
- Importo liquidato: [IMPORTO_LIQUIDATO]
- Differenza contestata: [DIFFERENZA]

Ritengo che la liquidazione non rispecchi il danno effettivamente subito e le condizioni contrattuali.

Chiedo pertanto una rivalutazione del sinistro e l integrazione dell indennizzo.

Cordiali saluti,
{{nome}}
{{email}}',
template_pec = 'RACCOMANDATA A/R TRAMITE PEC

Data: {{data_odierna}}
Oggetto: CONTESTAZIONE LIQUIDAZIONE PARZIALE SINISTRO - POLIZZA {{policy_number}}

Spett.le {{insurance_company}},

il/la sottoscritto/a {{nome}}, contesta la liquidazione parziale del sinistro del {{claim_date}}.

Richiedo entro 30 giorni l integrazione dell indennizzo o documentata motivazione del rigetto.

In difetto, procederò con reclamo a IVASS e azione legale.

{{nome}}
{{email}}'
WHERE title ILIKE '%liquidazione parziale%';

-- Estensione garanzia produttore non rispettata (warranty)
UPDATE opportunities 
SET template_email = 'Gentili Signori,

il/la sottoscritto/a {{nome}}, avendo acquistato il prodotto {{product_name}} in data {{purchase_date}}, segnala il mancato rispetto della garanzia estesa del produttore.

Dettagli:
- Prodotto: {{product_name}}
- Data acquisto: {{purchase_date}}
- Venditore: {{seller_name}}
- Importo: €{{purchase_amount}}
- Difetto: {{issue_description}}

L estensione di garanzia, regolarmente attivata, copre il difetto riscontrato. Chiedo pertanto l intervento in garanzia come da condizioni contrattuali.

Cordiali saluti,
{{nome}}
{{email}}',
template_pec = 'RACCOMANDATA A/R TRAMITE PEC

Data: {{data_odierna}}
Oggetto: RICHIESTA INTERVENTO IN GARANZIA ESTESA

Spett.le Produttore,

il/la sottoscritto/a {{nome}}, richiede l intervento in garanzia estesa per il prodotto {{product_name}} acquistato il {{purchase_date}}.

Difetto riscontrato: {{issue_description}}

Richiedo riparazione/sostituzione entro 30 giorni.

{{nome}}
{{email}}'
WHERE title ILIKE '%estensione garanzia%';