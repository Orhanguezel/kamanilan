# Geçici konsept içerikleri

Ana sayfa tasarım kabulü için resimli 5 ilan ve 4 haber kaydı
`135_concept_demo_content.sql` ile eklenir. Tüm kayıtlar `concept-demo-2026`
işaretini taşır ve gerçek kullanıcı içeriği değildir.

Tasarım kabulü tamamlanınca canlı veritabanında
`backend/scripts/sql/remove-concept-demo.sql` çalıştırılmalıdır. Ardından şu iki
sorgunun da `0` dönmesi beklenir:

```sql
SELECT COUNT(*) FROM properties WHERE internal_note = 'concept-demo-2026';
SELECT COUNT(*) FROM articles WHERE tags LIKE '%concept-demo-2026%';
```
