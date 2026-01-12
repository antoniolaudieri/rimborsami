-- Create refund_parameters table for storing official rates and thresholds
CREATE TABLE public.refund_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR NOT NULL,
  parameter_name VARCHAR NOT NULL,
  value DECIMAL(10,4) NOT NULL,
  unit VARCHAR,
  source VARCHAR,
  valid_from DATE NOT NULL,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, parameter_name, valid_from)
);

-- Enable RLS
ALTER TABLE public.refund_parameters ENABLE ROW LEVEL SECURITY;

-- Anyone can read parameters (public data from official sources)
CREATE POLICY "Anyone can view refund parameters" 
ON public.refund_parameters 
FOR SELECT 
USING (true);

-- Only admins can manage parameters
CREATE POLICY "Admins can manage refund parameters" 
ON public.refund_parameters 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert official Banca d'Italia usury thresholds Q2 2025
INSERT INTO public.refund_parameters (category, parameter_name, value, unit, source, valid_from, valid_to) VALUES
-- Mutui ipotecari
('bank_mutuo_fisso', 'tegm', 3.35, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_mutuo_fisso', 'soglia_usura', 8.1875, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_mutuo_variabile', 'tegm', 4.92, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_mutuo_variabile', 'soglia_usura', 10.15, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
-- Credito personale
('bank_credito_personale', 'tegm', 10.90, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_credito_personale', 'soglia_usura', 17.625, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
-- Carte di credito revolving
('bank_carta_revolving', 'tegm', 15.36, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_carta_revolving', 'soglia_usura', 23.20, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
-- Aperture di credito in conto corrente
('bank_fido_5000', 'tegm', 10.35, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_fido_5000', 'soglia_usura', 16.9375, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_fido_oltre_5000', 'tegm', 9.24, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_fido_oltre_5000', 'soglia_usura', 15.55, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
-- Credito finalizzato
('bank_credito_finalizzato', 'tegm', 10.36, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_credito_finalizzato', 'soglia_usura', 16.95, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
-- Cessione del quinto
('bank_cessione_quinto', 'tegm', 9.89, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_cessione_quinto', 'soglia_usura', 16.3625, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
-- Leasing
('bank_leasing', 'tegm', 5.67, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_leasing', 'soglia_usura', 11.0875, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
-- Factoring
('bank_factoring', 'tegm', 5.88, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
('bank_factoring', 'soglia_usura', 11.35, 'percent', 'Banca d''Italia - D.M. 31/03/2025', '2025-04-01', '2025-06-30'),
-- Voli EU 261/2004
('flight_short', 'compensazione', 250, 'euro', 'Regolamento CE 261/2004', '2004-02-17', NULL),
('flight_medium', 'compensazione', 400, 'euro', 'Regolamento CE 261/2004', '2004-02-17', NULL),
('flight_long', 'compensazione', 600, 'euro', 'Regolamento CE 261/2004', '2004-02-17', NULL),
('flight_long_delay_3h', 'compensazione', 300, 'euro', 'Regolamento CE 261/2004', '2004-02-17', NULL),
-- Multe stradali
('auto_multa', 'spese_notifica', 15, 'euro', 'Art. 203 CdS', '2023-01-01', NULL),
-- Lavoro
('work_straordinario', 'maggiorazione_base', 25, 'percent', 'CCNL', '2024-01-01', NULL),
('work_straordinario_festivo', 'maggiorazione_festivo', 50, 'percent', 'CCNL', '2024-01-01', NULL),
('work_tfr', 'divisore', 13.5, 'divisor', 'Art. 2120 c.c.', '1982-05-29', NULL),
-- Condominiali
('condominium_impugnazione', 'spese_legali_min', 500, 'euro', 'Tariffe forensi', '2024-01-01', NULL),
('condominium_impugnazione', 'spese_legali_max', 2000, 'euro', 'Tariffe forensi', '2024-01-01', NULL),
('condominium_impugnazione', 'termine_giorni', 30, 'days', 'Art. 1137 c.c.', '1942-04-04', NULL);