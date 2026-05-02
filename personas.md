# Kişisel - Survey-Based Personas

Bu personelar, `survey/mock_data_results.md` dosyasındaki 15 kişilik kullanıcı anketinden türetilmiştir. Örneklem üniversite öğrencisi ağırlıklıdır: katılımcıların %86'sı 18-24 yaş aralığındadır. Bu nedenle personelar özellikle genç yetişkinlerin haber tüketim alışkanlıklarını, sosyal medya merkezli gündem takibini, bilgi yorgunluğunu ve kişisel gazete fikrine yönelik farklı katılım seviyelerini temsil eder.

**Metod Notu:** Bu personelar, survey verisine dayanan kompozit karakterlerdir. Yaş, haber kaynağı, okuma biçimi, bilgi yoğunluğu, AI özet tercihi, serendipity beklentisi ve paylaşım davranışı gibi temel özellikler anket bulgularına dayanmaktadır. Kulüp rolü, günlük rutin, spesifik ilgi alanları ve örnek kullanım senaryoları gibi anlatısal detaylar ise personayı daha gerçekçi ve tasarım açısından daha kullanışlı hale getirmek için eklenmiştir.

## Survey'den Çıkan Ana Kullanıcı Segmentleri

Anket sonuçları üç güçlü davranış örüntüsü göstermektedir:

1. **Hızlı tarayan haber tüketicisi:** Katılımcıların %53'ü haberleri çoğunlukla başlıklara hızlıca bakarak takip etmektedir. Ayrıca %73'ü bilgi yoğunluğunu yorucu bulmaktadır. Bu grup için temel ihtiyaç, düşük bilişsel yük ve hızlı özet akışıdır.
2. **Yorumlayarak paylaşan küratör:** Katılımcıların %80'i haber paylaşırken kendi yorumunu eklediğini belirtmiştir. %26'lık bir grup ise kendi seçtiği haberlerden oluşan bir Kişisel Gazete hazırlamak istemektedir. Bu grup için temel ihtiyaç, editorial widget, yorum ekleme ve paylaşılabilir gazete yapısıdır.
3. **Takip eden ama üretmeyen okuyucu:** Katılımcıların %60'ı kendi gazetesini hazırlamasa da ilgi alanı uyuşan kişilerin hazırladığı gazeteleri okumak istediğini söylemiştir. Bu grup için temel ihtiyaç, güvenilir kürasyon, kolay abonelik ve filter bubble dışına kontrollü çıkıştır.

---

## Persona 1: Deniz Aydın - Zamanı Kısıtlı Hızlı Okuyucu

### Narrative

Deniz, 21 yaşında bilgisayar mühendisliği öğrencisidir. Gün içinde ders, proje toplantıları, kulüp işleri ve sosyal hayat arasında sürekli bölünmüş bir dikkate sahiptir. Haberleri takip etmek ister, çünkü hem dünyadan kopmak istemez hem de arkadaşlarıyla yapılan gündem konuşmalarında tamamen dışarıda kalmak istemez. Fakat haber okuma onun için çoğu zaman bilinçli ve uzun bir okuma pratiği değil, ders aralarında veya toplu taşımada yaptığı kısa bir tarama davranışıdır.

Deniz'in haber kaynağı büyük ölçüde sosyal medyadır. X/Twitter ve Instagram'da karşısına çıkan başlıklara bakar, ilgisini çekerse birkaç yorumu okur, nadiren haberin asıl kaynağına gider. Bu davranış survey sonuçlarıyla örtüşür: katılımcıların %93'ü günlük haberleri sosyal medyadan takip etmektedir ve %53'ü haberleri başlık seviyesinde hızlıca taradığını belirtmiştir. Deniz'in temel problemi haber eksikliği değil, çok fazla haber ve çok fazla dikkat dağıtıcı sinyal olmasıdır.

Deniz için mevcut haber platformları iki uç arasında sıkışmıştır: sosyal medya çok hızlıdır ama dağınıktır; geleneksel haber siteleri daha güvenilirdir ama fazla yoğun ve zaman alıcıdır. Bu yüzden Deniz, haberleri daha yönetilebilir bir yoğunlukta görmek ister. AI tarafından hazırlanmış kısa ve tarafsız özetler, onun için haberin tamamının yerine geçen bir otorite değil, "bu habere zaman ayırmaya değer mi?" kararını vermesini sağlayan bir ön filtre olur.

### Persona

| Alan | Açıklama |
| --- | --- |
| Ad | Deniz Aydın |
| Yaş | 21 |
| Rol | Üniversite öğrencisi |
| Haber alışkanlığı | Başlık ve kısa özet tarama |
| Ana platformlar | X/Twitter, Instagram, Google News |
| Teknoloji rahatlığı | Yüksek |
| Motivasyon | Gündemden kopmamak, kısa sürede ana gelişmeleri anlamak |
| Frustration | Bilgi yoğunluğu, clickbait başlıklar, sürekli tekrar eden konular |
| Survey dayanağı | %73 bilgi yoğunluğunu yorucu buluyor; %53 başlık seviyesinde okuyor; %73 AI özetleri faydalı buluyor |

### Goals

- Günlük haberleri 5-10 dakika içinde taramak.
- Sadece ilgilendiği kategorileri öncelikli görmek.
- Clickbait başlıklara tıklamadan önce haberin gerçekten ne anlattığını anlamak.
- Gerektiğinde orijinal kaynağa hızlıca geçebilmek.

### Pain Points

- Sosyal medya akışı çok hızlı ve bağlamsızdır.
- Aynı haber farklı hesaplardan tekrar tekrar görünür.
- Uzun haber metinleri ders aralarında okunamayacak kadar zaman alır.
- Öneri algoritmalarının neye göre haber gösterdiği belirsizdir.

### Scenario

Deniz sabah kampüse gitmeden önce kahvesini alır ve Kişisel'i açar. Ana ekranında "Headline Mode" varsayılan olarak aktiftir. Teknoloji, dünya ve ekonomi widget'ları üst sıradadır; spor ve magazin gibi ilgilenmediği alanlar görünmez. Deniz önce başlıklara bakar, ardından ilgisini çeken iki haberde AI tarafından hazırlanmış 2-3 cümlelik özeti açar. Bir haberin önemli olduğunu düşünür ve "Full Context" moduna geçerek orijinal kaynağa gider. Günün geri kalanında haber okumaya ayrıca vakit ayırmadan temel gündemi yakalamış olur.

### Design Implications

- Varsayılan deneyim hızlı taramaya uygun olmalıdır.
- Reading mode kontrolü görünür ve düşük eforlu olmalıdır.
- AI özetleri kısa, kaynak bağlantısı ise her zaman erişilebilir olmalıdır.
- Kart yoğunluğu ayarlanabilir olmalı; kullanıcı başlık, özet ve full context arasında geçiş yapabilmelidir.

---

## Persona 2: Ece Karaca - Yorumlayan Küratör

### Narrative

Ece, 23 yaşında iletişim fakültesi öğrencisidir ve kampüs medyasında aktif rol alır. Haberleri yalnızca tüketilecek içerikler olarak değil, tartışma başlatan sosyal nesneler olarak görür. Arkadaş grubunda sık sık haber paylaşır; fakat genellikle yalnızca link atmakla yetinmez. Haberin neden önemli olduğunu, hangi yönünün eksik tartışıldığını veya kendi pozisyonunu kısa bir yorumla belirtir.

Ece'nin davranışı survey'deki sosyal kürasyon bulgularıyla doğrudan örtüşür: katılımcıların %80'i haber paylaşırken kendi yorumunu eklediğini belirtmiştir. Ayrıca %26'lık bir grup kendi seçtiği haberlerden ve yorumlardan oluşan bir Kişisel Gazete hazırlamak istemektedir. Bu oran küçük görünse de HCI açısından kritiktir; çünkü bu kullanıcılar platformun en aktif ve üretken segmentini oluşturur. Ece gibi kullanıcılar yalnızca arayüzü kullanmaz, başkaları için değer üreten içerik yapıları oluşturur.

Ece'nin mevcut araçlarla yaşadığı sorun, yorumunun haberden kopuk kalmasıdır. WhatsApp'ta link üstüne yazdığı yorum kaybolur; sosyal medyada paylaştığı gönderi algoritmanın akışında erir; Notion veya Google Docs gibi araçlar ise haber akışıyla doğal biçimde bütünleşmez. Ece, haberleri seçebileceği, yanlarına kendi editoryal notlarını ekleyebileceği ve bunu tek bir okunabilir gazete olarak paylaşabileceği bir alana ihtiyaç duyar.

### Persona

| Alan | Açıklama |
| --- | --- |
| Ad | Ece Karaca |
| Yaş | 23 |
| Rol | İletişim öğrencisi, kampüs medya kulübü üyesi |
| Haber alışkanlığı | Özet okur, ilgisini çekerse detay ve kaynak karşılaştırması yapar |
| Ana platformlar | X/Twitter, haber siteleri, arkadaş grupları |
| Teknoloji rahatlığı | Orta-yüksek |
| Motivasyon | Haberleri bağlamlandırmak, kendi bakış açısıyla paylaşmak, tartışma başlatmak |
| Frustration | Paylaşılan linklerin bağlamsız kalması, yorumların haberden ayrılması, platformların kullanıcı sesine az yer vermesi |
| Survey dayanağı | %80 haber paylaşırken yorum ekliyor; %46 çok sık haber paylaşıyor; %26 kişisel gazete hazırlamak istiyor |

### Goals

- Haberleri kendi bakış açısıyla düzenlemek.
- Haber kartlarının yanına kısa editoryal yorumlar eklemek.
- Hazırladığı gazete düzenini arkadaşlarıyla paylaşmak.
- Okuyucuların hem haberi hem kendi yorumunu aynı bağlamda görmesini sağlamak.

### Pain Points

- Sosyal medyada haberin bağlamı hızlıca kaybolur.
- Link paylaşımı kişisel yorum için yeterli alan sağlamaz.
- Mevcut haber uygulamaları kullanıcıyı pasif okuyucu olarak konumlandırır.
- Birden fazla kaynaktan derlediği haberleri tek bir tutarlı yapıda sunmak zordur.

### Scenario

Ece, yaklaşan öğrenci konseyi seçimiyle ilgili haberleri ve kampüs gündemine bağlı ulusal eğitim haberlerini takip etmektedir. Kişisel'de bir "Education & Campus" widget'ı, bir "Politics" widget'ı ve bir "Editorial Note" widget'ı ekler. Bir haberin yanına "Bu gelişme öğrencilerin barınma gündemiyle birlikte okunmalı" diye kısa bir not yazar. Ardından ekonomiyle ilgili bağlantılı bir haberi ikinci sıraya taşır ve gazetesine "Haftanın Kampüs Gündemi" adını verir. Paylaş butonuyla arkadaşlarına public link gönderir. Arkadaşları yalnızca haber linklerini değil, Ece'nin kurduğu sıralamayı ve yorum çerçevesini de görür.

### Design Implications

- Editorial Widget bir yan özellik değil, ana içerik tipi olmalıdır.
- Kullanıcı yorumlarının kime ait olduğu açıkça görünmelidir.
- Paylaşılabilir gazete linki kalıcı ve okunabilir olmalıdır.
- Layout düzenleme, haber seçme ve yorum yazma akışı birbirinden kopuk hissettirmemelidir.

---

## Persona 3: Mert Yılmaz - Güvenilir Kürasyon Takipçisi

### Narrative

Mert, 22 yaşında işletme öğrencisidir. Haberleri takip etmek ister ancak kendi haber akışını düzenlemeye veya uzun uzun kaynak seçmeye zaman ayırmak istemez. Sosyal medyadaki öneri algoritmalarına da tam olarak güvenmez; çünkü sürekli aynı politik tartışmaların, benzer yorumların ve tekrar eden gündemlerin içinde kaldığını hisseder. Mert için problem yalnızca bilgi yoğunluğu değil, hangi bilginin gerçekten önemli olduğunu ayıklama zahmetidir.

Survey sonuçları Mert gibi kullanıcıların projenin merkezinde olduğunu gösterir. Katılımcıların %80'i algoritmaların onları benzer görüşlere hapsettiğini hissetmektedir. Ayrıca %60'ı kendi kişisel gazetesini hazırlamasa da ilgi alanı uyuşan kişilerin hazırladığı gazeteleri okumak istediğini belirtmiştir. Bu, Kişisel'in yalnızca üretici/küratör kullanıcılar için değil, kürasyonu takip eden pasif-aktif arası kullanıcılar için de değerli olduğunu gösterir.

Mert tamamen pasif değildir; sadece her gün sıfırdan haber seçmek istemez. Güvendiği kişilerin veya ilgi alanı benzer kullanıcıların hazırladığı gazete düzenlerini takip etmek ister. Aynı zamanda yalnızca kendi çevresinin ilgilendiği haberlerle sınırlı kalmak istemez. Bu nedenle Popular ve Random News gibi tasarlanmış serendipity alanları Mert için önemlidir: Bunlar algoritmik olarak gizli değil, açıkça "farklı bir şey keşfet" amacıyla sunulan bölümlerdir.

### Persona

| Alan | Açıklama |
| --- | --- |
| Ad | Mert Yılmaz |
| Yaş | 22 |
| Rol | İşletme öğrencisi |
| Haber alışkanlığı | Arkadaş önerileri ve popüler gündem üzerinden takip |
| Ana platformlar | Instagram, Google News, WhatsApp grupları |
| Teknoloji rahatlığı | Orta |
| Motivasyon | Güvendiği kişilerden süzülmüş haber okumak, gündemi kaçırmamak |
| Frustration | Filter bubble, tekrar eden konular, güvenilir seçki bulma zorluğu |
| Survey dayanağı | %80 filter bubble hissediyor; %60 başkalarının hazırladığı gazeteleri okumak istiyor; %53 random/popular keşif bölümünü kesinlikle istiyor |

### Goals

- Güvendiği kişilerin hazırladığı haber seçkilerini takip etmek.
- Kendi akışını sürekli düzenlemek zorunda kalmadan kaliteli haber görmek.
- Popüler gündemin yanında ilgi alanı dışındaki konuları da keşfetmek.
- Haberleri kısa özetlerle okuyup gerektiğinde kaynağa gitmek.

### Pain Points

- Algoritmaların benzer içerikleri tekrar tekrar göstermesi.
- Kaynak seçme ve akış düzenleme işinin zahmetli olması.
- Sosyal medyada haber ile yorumun karışması.
- Bir haberin neden önemli olduğunu anlamak için fazladan bağlam aramak zorunda kalması.

### Scenario

Mert, sınav haftasında haberleri detaylı takip edemediğini fark eder. Kişisel'e girer ve Ece'nin paylaştığı "Haftanın Kampüs Gündemi" gazetesine abone olur. Ana ekranında bu gazete read-only biçimde görünür; haberlerin yanında Ece'nin kısa yorumları da vardır. Mert birkaç başlığı okuduktan sonra Random News widget'ında teknoloji dışı bir sağlık politikası haberine denk gelir. Normalde bu haberi sosyal medya akışında görmeyeceğini düşünür, AI özetini okur ve kaynağı açar. Böylece hem güvendiği bir kürasyon üzerinden hızlıca gündeme bağlanır hem de filter bubble dışına kontrollü biçimde çıkar.

### Design Implications

- Abone olma ve takip etme akışı basit olmalıdır.
- Shared newspaper görünümü read-only ve anlaşılır olmalıdır.
- Curator adı, açıklaması ve yorumları güven ilişkisini desteklemelidir.
- Popular/Random widget'ları görünür olmalı ve sistemin neden bu haberleri gösterdiği sezilebilir olmalıdır.

---

## Cross-Persona Requirements

Bu üç persona birlikte değerlendirildiğinde Kişisel'in öncelikli tasarım gereksinimleri şunlardır:

| Requirement | İlgili Persona | Survey Temeli |
| --- | --- | --- |
| AI destekli 2-3 cümlelik tarafsız özetler | Deniz, Mert | %73 AI özetleri zaman kazandırıcı buluyor |
| Reading modes: headline, summary, full context | Deniz | %93 başlık/özet seviyesinde okuyor |
| Özelleştirilebilir widget layout | Deniz, Ece | %86 ekranı kendi isteğine göre tasarlamak istiyor |
| Editorial Widget | Ece | %80 haber paylaşırken yorum ekliyor |
| Shareable Personal Newspaper | Ece, Mert | %26 hazırlamak istiyor, %60 başkalarının hazırladığını okumak istiyor |
| Popular/Random serendipity alanı | Mert, Deniz | %80 filter bubble hissediyor, %53 random/popular bölümü kesinlikle istiyor |
| Source attribution ve orijinal kaynağa geçiş | Tüm personelar | Clickbait ve güven problemi survey'de güçlü biçimde görülüyor |

## HCI Açısından Temellendirme

Bu personelar yalnızca demografik profiller olarak değil, farklı etkileşim ihtiyaçlarını temsil eden davranışsal arketipler olarak tasarlanmıştır:

- **Deniz**, cognitive load ve progressive disclosure problemini temsil eder. Onun için arayüz, haber yoğunluğunu azaltmalı ve kullanıcıya okuma derinliğini kontrol etme imkanı vermelidir.
- **Ece**, user agency ve gatewatching yaklaşımını temsil eder. Onun için sistem, kullanıcının haber akışına kendi sesini eklemesini ve bunu sosyal bir artifact olarak paylaşmasını desteklemelidir.
- **Mert**, filter bubble ve trust-based social curation problemini temsil eder. Onun için sistem, güvenilir insan kürasyonunu ve tasarlanmış serendipity mekanizmalarını birleştirmelidir.

Bu nedenle Kişisel'in temel tasarım kararı, kullanıcıyı tek tip bir "haber okuyucusu" olarak görmek yerine, farklı okuma derinliği, üretim isteği ve güven ihtiyacına sahip kullanıcıları aynı widget tabanlı sistem içinde desteklemektir.

## Prototype İçin Öneriler

1. **İlk ekranda üç mod net görünmeli:** Headline, Summary ve Full Context modları, Deniz gibi hızlı kullanıcıların ürünü hemen anlamasını sağlar.
2. **Editorial Widget demo akışta mutlaka yer almalı:** Ece personası projenin en özgün katkısını temsil ediyor. Bu nedenle yorum ekleme özelliği prototipte görünür ve çalışır olmalı.
3. **Shared newspaper akışı tek linkle gösterilmeli:** Mert personası için "ben üretmem ama takip ederim" davranışı kritik. Public gazete linki ve subscribe/follow butonu test senaryosuna eklenmeli.
4. **Random/Popular bölümü opsiyonel gibi saklanmamalı:** Filter bubble bulgusu çok güçlü olduğu için bu alan onboarding veya default layout içinde görünür olmalı.
5. **AI özetlerinde kaynak güveni korunmalı:** Her özet kartında kaynak adı, tarih ve orijinal habere gitme aksiyonu yer almalı.
6. **Persona bazlı test görevleri hazırlanmalı:** Usability testte Deniz için "5 dakikada gündemi tara", Ece için "yorumlu gazete hazırla", Mert için "bir gazeteye abone ol ve farklı bir haber keşfet" görevleri kullanılabilir.
