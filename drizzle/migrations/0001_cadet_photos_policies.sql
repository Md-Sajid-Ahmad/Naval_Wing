CREATE POLICY "cadet photos read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'cadet-photos');
CREATE POLICY "cadet photos insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'cadet-photos');
CREATE POLICY "cadet photos update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'cadet-photos');
CREATE POLICY "cadet photos delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'cadet-photos');