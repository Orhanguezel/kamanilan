// =============================================================
// FILE: src/test-setup.ts
// bun test on-yukleme dosyasi (bunfig.toml [test].preload)
// Component testleri (@testing-library/react render) icin DOM ortami kaydeder.
// Not: happy-dom global'leri tum test dosyalarinda gorunur; window'u degistiren
// testler afterEach'te SILMEK yerine orijinal degeri GERI YUKLEMELIDIR.
// =============================================================
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();
