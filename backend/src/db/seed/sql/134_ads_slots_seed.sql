INSERT INTO ads_slots
  (slot_key,label,page_type,placement_description,desktop_capacity,mobile_capacity,mobile_behavior,recommended_size,aspect_ratio,source_types,delivery_mode,base_daily_price,display_order)
VALUES
  ('global_top','Global üst reklam','global','Site başlığının altında',1,1,'single','970×90 / 320×100','97/9',JSON_ARRAY('custom','listing','seller','code'),'rotation',450,10),
  ('global_footer','Global footer reklamı','global','Footer alanının üstünde',1,1,'single','970×90 / 320×100','97/9',JSON_ARRAY('custom','listing','seller','code'),'rotation',250,20),
  ('home_hero_below','Ana sayfa hero altı','home','Hero ile yeni ilanlar arasında',1,1,'single','970×90 / 320×100','97/9',JSON_ARRAY('custom','listing','seller','code'),'rotation',400,30),
  ('home_mid','Ana sayfa içerik içi','home','Ana sayfa bölümleri arasında',2,1,'scroll','468×120','39/10',JSON_ARRAY('custom','listing','seller'),'rotation',300,40),
  ('listings_top','İlanlar üst reklamı','listings','Sonuç başlığının altında',1,1,'single','970×90 / 320×100','97/9',JSON_ARRAY('custom','listing','seller','code'),'rotation',350,60),
  ('listings_sidebar','İlanlar yan sütun','listings','Masaüstü filtre ve sonuç alanının yanında',1,1,'hide','300×250','6/5',JSON_ARRAY('custom','listing','seller'),'rotation',275,70),
  ('listing_detail_below','İlan detayı alt reklam','listing_detail','İlan açıklamasının altında',1,1,'single','728×90 / 320×100','81/10',JSON_ARRAY('custom','listing','seller'),'rotation',275,75),
  ('category_inline','Kategori içerik içi','category','İlan grid satırları arasında',2,1,'single','468×120','39/10',JSON_ARRAY('custom','listing','seller'),'rotation',275,80),
  ('news_top','Haberler üst reklamı','news','Haber liste başlığının altında',1,1,'single','970×90 / 320×100','97/9',JSON_ARRAY('custom','seller','code'),'rotation',250,80),
  ('news_detail_inline','Haber detayı içerik içi','news_detail','Haber metninin içinde',1,1,'single','728×90 / 320×100','81/10',JSON_ARRAY('custom','seller','code'),'rotation',225,100),
  ('news_detail_sidebar','Haber detayı yan sütun','news_detail','Haber detayının yan sütununda',1,1,'hide','300×250','6/5',JSON_ARRAY('custom','seller'),'rotation',200,110),
  ('announcements_top','Duyurular üst reklamı','announcements','Duyuru listesinin üstünde',1,1,'single','970×90 / 320×100','97/9',JSON_ARRAY('custom','seller','code'),'rotation',175,120),
  ('listing_detail_sidebar','İlan detayı yan sütun','listing_detail','Satıcı kartının yakınında',1,1,'single','300×250','6/5',JSON_ARRAY('custom','listing','seller'),'rotation',325,130),
  ('store_detail_sidebar','Mağaza detayı yan sütun','store_detail','Mağaza profilinin yan sütununda',1,1,'single','300×250','6/5',JSON_ARRAY('custom','listing','seller'),'rotation',275,140)
ON DUPLICATE KEY UPDATE
  label=VALUES(label), page_type=VALUES(page_type), placement_description=VALUES(placement_description),
  desktop_capacity=VALUES(desktop_capacity), mobile_capacity=VALUES(mobile_capacity),
  mobile_behavior=VALUES(mobile_behavior), recommended_size=VALUES(recommended_size), aspect_ratio=VALUES(aspect_ratio),
  source_types=VALUES(source_types), delivery_mode=VALUES(delivery_mode), base_daily_price=VALUES(base_daily_price),
  display_order=VALUES(display_order), is_active=1;
