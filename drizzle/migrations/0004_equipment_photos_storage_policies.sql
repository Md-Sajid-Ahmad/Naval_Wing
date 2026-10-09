CREATE POLICY equipment_photos_select ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'equipment-photos');
CREATE POLICY equipment_photos_insert ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'equipment-photos');
CREATE POLICY equipment_photos_update ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'equipment-photos') WITH CHECK (bucket_id = 'equipment-photos');
CREATE POLICY equipment_photos_delete ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'equipment-photos');