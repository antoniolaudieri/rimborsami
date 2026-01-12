-- Add source_url column to opportunities table for tracking legal sources
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.opportunities.source_url IS 'URL to the legal source or official document for this opportunity';

-- Update existing opportunities with real source URLs
UPDATE public.opportunities SET source_url = 'https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32004R0261' 
WHERE category = 'flight' AND legal_reference LIKE '%261/2004%';

UPDATE public.opportunities SET source_url = 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2005-09-06;206' 
WHERE category = 'ecommerce' AND legal_reference LIKE '%206/2005%';

UPDATE public.opportunities SET source_url = 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1993-09-01;385' 
WHERE category = 'bank' AND legal_reference LIKE '%385/1993%';

UPDATE public.opportunities SET source_url = 'https://www.ivass.it/normativa/nazionale/secondaria-ivass/regolamenti/2008/n24/Regolamento_n__24.pdf' 
WHERE category = 'insurance' AND legal_reference LIKE '%IVASS%';

UPDATE public.opportunities SET source_url = 'https://www.agcom.it/documentazione/documento?p_p_auth=fLw7zRht&p_p_id=101_INSTANCE_FnOw5lVOIXoE&p_p_lifecycle=0&p_p_col_id=column-1&p_p_col_count=1&_101_INSTANCE_FnOw5lVOIXoE_struts_action=%2Fasset_publisher%2Fview_content&_101_INSTANCE_FnOw5lVOIXoE_assetEntryId=798281&_101_INSTANCE_FnOw5lVOIXoE_type=document' 
WHERE category = 'telecom' AND legal_reference LIKE '%AGCOM%';