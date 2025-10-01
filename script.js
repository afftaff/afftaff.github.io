const STORAGE_VERSION = 'v1';
const STORAGE_KEYS = {
  decks: `ankiDecks-${STORAGE_VERSION}`,
  order: `ankiDeckOrder-${STORAGE_VERSION}`,
  srs: `ankiSrs-${STORAGE_VERSION}`,
  voices: `ankiVoices-${STORAGE_VERSION}`
};

const RAW_DATA = `english,romaji,japanese,tags/0,tags/1,tags/2,usefulness,tags/3
Hello.,Konnichiwa.,こんにちは。,Greetings,Conversation,,8,
Good morning.,Ohayou gozaimasu.,おはようございます。,Greetings,Time of Day,,8,
Good evening.,Konban wa.,こんばんは。,Greetings,Time of Day,,8,
Good night.,Oyasumi nasai.,おやすみなさい。,Greetings,Time of Day,,8,
How are you?,O-genki desu ka?,お元気ですか？,Conversation,Questions,,8,
"I'm fine, thank you.",Genki desu. Arigatou.,元気です。ありがとう。,Conversation,Responses,,8,
Nice to meet you.,Hajimemashite.,はじめまして。,Introductions,Conversation,,8,
Please treat me well.,Yoroshiku onegai shimasu.,よろしくお願いします。,Introductions,Polite Expressions,,8,
See you later.,Mata ne.,またね。,Farewells,Casual,,8,
Goodbye.,Sayonara.,さようなら。,Farewells,General,,8,
Thank you.,Arigatou.,ありがとう。,Gratitude,Everyday,,8,
Thank you very much.,Arigatou gozaimasu.,ありがとうございます。,Gratitude,Formal,,8,
"No, thank you.",Iie, kekkou desu.,いいえ、結構です。,Polite Expressions,Responses,,8,
Please.,Onegai shimasu.,お願いします。,Requests,Polite Expressions,,8,
Excuse me.,Sumimasen.,すみません。,Polite Expressions,Attention,,8,
I'm sorry.,Gomennasai.,ごめんなさい。,Apologies,Polite Expressions,,8,
Yes.,Hai.,はい。,Responses,Basic,,8,
No.,Iie.,いいえ。,Responses,Basic,,8,
Okay.,Daijoubu desu.,大丈夫です。,Responses,Assurance,,8,
Please speak slowly.,Yukkuri hanashite kudasai.,ゆっくり話してください。,Communication Help,Requests,,8,
Please say it again.,Mou ichido itte kudasai.,もう一度言ってください。,Communication Help,Requests,,8,
Do you understand?,Wakarimasu ka?,分かりますか？,Communication Help,Questions,,8,
I understand.,Wakarimashita.,分かりました。,Communication Help,Responses,,8,
I don't understand.,Wakarimasen.,分かりません。,Communication Help,Responses,,8,
Do you speak English?,Eigo o hanasemasu ka?,英語を話せますか？,Communication Help,Questions,,8,
Where is the station?,Eki wa doko desu ka?,駅はどこですか？,Directions,Questions,,8,
Where is the bathroom?,Toire wa doko desu ka?,トイレはどこですか？,Directions,Questions,,8,
Where is the convenience store?,Konbini wa doko desu ka?,コンビニはどこですか？,Directions,Questions,,8,
Please show me on the map.,Chizu de oshiete kudasai.,地図で教えてください。,Directions,Requests,,8,
Go straight.,Massugu itte kudasai.,まっすぐ行ってください。,Directions,Instructions,,8,
Turn right.,Migi ni magatte kudasai.,右に曲がってください。,Directions,Instructions,,8,
Turn left.,Hidari ni magatte kudasai.,左に曲がってください。,Directions,Instructions,,8,
It's over here.,Koko desu.,ここです。,Directions,Statements,,8,
It's over there.,Asoko desu.,あそこです。,Directions,Statements,,8,
Please help me.,Tasukete kudasai.,助けてください。,Emergency,Requests,,8,
Call the police.,Keisatsu o yonde kudasai.,警察を呼んでください。,Emergency,Requests,,8,
Call an ambulance.,Kyukyusha o yonde kudasai.,救急車を呼んでください。,Emergency,Requests,,8,
I'm lost.,Mayoimashita.,迷いました。,Emergency,Statements,,8,
I feel sick.,Kibun ga warui desu.,気分が悪いです。,Health,Statements,,8,
I have a fever.,Netsu ga arimasu.,熱があります。,Health,Statements,,8,
My stomach hurts.,Onaka ga itai desu.,お腹が痛いです。,Health,Statements,,8,
My head hurts.,Atama ga itai desu.,頭が痛いです。,Health,Statements,,8,
I need a doctor.,Isha ga hitsuyou desu.,医者が必要です。,Health,Requests,,8,
Please give me water.,Mizu o kudasai.,水をください。,Food & Drink,Requests,,8,
Please give me tea.,Ocha o kudasai.,お茶をください。,Food & Drink,Requests,,8,
Please give me this.,Kore o kudasai.,これをください。,Shopping,Requests,,8,
How much is this?,Kore wa ikura desu ka?,これはいくらですか？,Shopping,Questions,,8,
I'll take this.,Kore ni shimasu.,これにします。,Shopping,Statements,,8,
Can I try it on?,Shichaku shite mo ii desu ka?,試着してもいいですか？,Shopping,Questions,,8,
Please give me the check.,Okaikei o onegai shimasu.,お会計をお願いします。,Dining,Requests,,8,
Separate checks, please.,Betsubetsu de onegai shimasu.,別々でお願いします。,Dining,Requests,,8,
Delicious!,Oishii!,おいしい！,Dining,Reactions,,8,
It was delicious.,Oishikatta desu.,おいしかったです。,Dining,Reactions,,8,
Cheers!,Kanpai!,乾杯！,Dining,Expressions,,8,
Please give me a menu.,Menyuu o kudasai.,メニューをください。,Dining,Requests,,8,
Do you have vegetarian options?,Bejitarian menyuu wa arimasu ka?,ベジタリアンメニューはありますか？,Dining,Questions,,8,
No meat, please.,Niku nashi de onegai shimasu.,肉なしでお願いします。,Dining,Requests,,8,
I have an allergy.,Arerugii ga arimasu.,アレルギーがあります。,Health,Statements,,8,
Where is my seat?,Watashi no seki wa doko desu ka?,私の席はどこですか？,Travel,Questions,,8,
Does this train go to Tokyo?,Kono densha wa Toukyou e ikimasu ka?,この電車は東京へ行きますか？,Travel,Questions,,8,
Where is the bus stop?,Basutei wa doko desu ka?,バス停はどこですか？,Travel,Questions,,8,
One ticket to Tokyo, please.,Toukyou made no kippu o ichi-mai kudasai.,東京までの切符を一枚ください。,Travel,Requests,,8,
Two tickets, please.,Kippu o ni-mai kudasai.,切符を二枚ください。,Travel,Requests,,8,
When does it leave?,Itsu demasu ka?,いつ出ますか？,Travel,Questions,,8,
What time does it arrive?,Nanji ni tsukimasu ka?,何時に着きますか？,Travel,Questions,,8,
Where is the taxi stand?,Takushii noriba wa doko desu ka?,タクシー乗り場はどこですか？,Travel,Questions,,8,
Please take me to this address.,Kono juusho made onegai shimasu.,この住所までお願いします。,Travel,Requests,,8,
How long does it take?,Donokurai kakarimasu ka?,どのくらいかかりますか？,Travel,Questions,,8,
How far is it?,Donokurai tooi desu ka?,どのくらい遠いですか？,Travel,Questions,,8,
I'd like to reserve a room.,Heya o yoyaku shitai desu.,部屋を予約したいです。,Lodging,Requests,,8,
Do you have any vacancies?,Aki wa arimasu ka?,空きはありますか？,Lodging,Questions,,8,
For two nights, please.,Futsuka bun onegai shimasu.,二泊分お願いします。,Lodging,Requests,,8,
Is breakfast included?,Choushoku wa fukumarete imasu ka?,朝食は含まれていますか？,Lodging,Questions,,8,
What time is check-out?,Chekkuauto wa nanji desu ka?,チェックアウトは何時ですか？,Lodging,Questions,,8,
Where is the elevator?,Erebeetaa wa doko desu ka?,エレベーターはどこですか？,Lodging,Questions,,8,
Where is the Wi-Fi password?,Waifai no pasuwaado wa doko desu ka?,Wi-Fiのパスワードはどこですか？,Technology,Questions,,8,
Can I charge my phone here?,Koko de denwa o juuden shite mo ii desu ka?,ここで電話を充電してもいいですか？,Technology,Questions,,8,
I need help with this.,Kore ni tetsudai ga hitsuyou desu.,これに手伝いが必要です。,Assistance,Requests,,8,
Please write it down.,Kaite kudasai.,書いてください。,Communication Help,Requests,,8,
What does this mean?,Kore wa dou iu imi desu ka?,これはどういう意味ですか？,Communication Help,Questions,,8,
How do you read this?,Kore wa dou yonde imasu ka?,これはどう読んでいますか？,Communication Help,Questions,,8,
Is this correct?,Kore de tadashii desu ka?,これで正しいですか？,Communication Help,Questions,,8,
Can you repeat that?,Kurikaeshite moraemasu ka?,繰り返してもらえますか？,Communication Help,Requests,,8,
What is your name?,O-namae wa nan desu ka?,お名前は何ですか？,Introductions,Questions,,8,
My name is...,Watashi no namae wa ... desu.,私の名前は…です。,Introductions,Statements,,8,
Where are you from?,Doko kara kimashita ka?,どこから来ましたか？,Introductions,Questions,,8,
I'm from the United States.,Amerika kara kimashita.,アメリカから来ました。,Introductions,Statements,,8,
How old are you?,O-toshi wa o-ikutsu desu ka?,お年はおいくつですか？,Introductions,Questions,,8,
I'm 25 years old.,Watashi wa nijuu go sai desu.,私は二十五歳です。,Introductions,Statements,,8,
I like Japan.,Nihon ga suki desu.,日本が好きです。,Conversation,Statements,,8,
I love this.,Kore ga daisuki desu.,これが大好きです。,Conversation,Statements,,8,
This is fun.,Tanoshii desu.,楽しいです。,Conversation,Statements,,8,
That's interesting.,Omoshiroi desu.,面白いです。,Conversation,Statements,,8,
I'm hungry.,Onaka ga sukimashita.,お腹が空きました。,Physical State,Statements,,8,
I'm thirsty.,Nodo ga kawakimashita.,喉が渇きました。,Physical State,Statements,,8,
I'm tired.,Tsukaremashita.,疲れました。,Physical State,Statements,,8,
I'm hot.,Atsui desu.,暑いです。,Physical State,Statements,,8,
I'm cold.,Samui desu.,寒いです。,Physical State,Statements,,8,
It hurts here.,Koko ga itai desu.,ここが痛いです。,Health,Statements,,8,
I feel better.,Kibun ga yokunarimashita.,気分が良くなりました。,Health,Statements,,8,
What time is it?,Ima nanji desu ka?,今何時ですか？,Time,Questions,,8,
It's one o'clock.,Ima wa ichi-ji desu.,今は一時です。,Time,Statements,,8,
It's two o'clock.,Ima wa ni-ji desu.,今は二時です。,Time,Statements,,8,
It's three o'clock.,Ima wa san-ji desu.,今は三時です。,Time,Statements,,8,
It's four o'clock.,Ima wa yo-ji desu.,今は四時です。,Time,Statements,,8,
It's five o'clock.,Ima wa go-ji desu.,今は五時です。,Time,Statements,,8,
It's six o'clock.,Ima wa roku-ji desu.,今は六時です。,Time,Statements,,8,
It's seven o'clock.,Ima wa shichi-ji desu.,今は七時です。,Time,Statements,,8,
It's eight o'clock.,Ima wa hachi-ji desu.,今は八時です。,Time,Statements,,8,
It's nine o'clock.,Ima wa ku-ji desu.,今は九時です。,Time,Statements,,8,
It's ten o'clock.,Ima wa juu-ji desu.,今は十時です。,Time,Statements,,8,
It's eleven o'clock.,Ima wa juuichi-ji desu.,今は十一時です。,Time,Statements,,8,
It's twelve o'clock.,Ima wa juuni-ji desu.,今は十二時です。,Time,Statements,,8,
What day is it today?,Kyou wa nanyoubi desu ka?,今日は何曜日ですか？,Time,Questions,,8,
It's Monday.,Kyou wa getsuyoubi desu.,今日は月曜日です。,Time,Statements,,8,
It's Tuesday.,Kyou wa kayoubi desu.,今日は火曜日です。,Time,Statements,,8,
It's Wednesday.,Kyou wa suiyoubi desu.,今日は水曜日です。,Time,Statements,,8,
It's Thursday.,Kyou wa mokuyoubi desu.,今日は木曜日です。,Time,Statements,,8,
It's Friday.,Kyou wa kinyoubi desu.,今日は金曜日です。,Time,Statements,,8,
It's Saturday.,Kyou wa doyoubi desu.,今日は土曜日です。,Time,Statements,,8,
It's Sunday.,Kyou wa nichiyoubi desu.,今日は日曜日です。,Time,Statements,,8,
What is the date today?,Kyou wa nannichi desu ka?,今日は何日ですか？,Time,Questions,,8,
It's the first.,Kyou wa tsuitachi desu.,今日は一日です。,Time,Statements,,8,
It's the second.,Kyou wa futsuka desu.,今日は二日です。,Time,Statements,,8,
It's the third.,Kyou wa mikka desu.,今日は三日です。,Time,Statements,,8,
It's the fourth.,Kyou wa yokka desu.,今日は四日です。,Time,Statements,,8,
It's the fifth.,Kyou wa itsuka desu.,今日は五日です。,Time,Statements,,8,
It's the sixth.,Kyou wa muika desu.,今日は六日です。,Time,Statements,,8,
It's the seventh.,Kyou wa nanoka desu.,今日は七日です。,Time,Statements,,8,
It's the eighth.,Kyou wa youka desu.,今日は八日です。,Time,Statements,,8,
It's the ninth.,Kyou wa kokonoka desu.,今日は九日です。,Time,Statements,,8,
It's the tenth.,Kyou wa tooka desu.,今日は十日です。,Time,Statements,,8,
It's the twentieth.,Kyou wa hatsuka desu.,今日は二十日です。,Time,Statements,,8,
What is your phone number?,Denwa bangou wa nan ban desu ka?,電話番号は何番ですか？,Personal,Questions,,8,
My phone number is...,Watashi no denwa bangou wa ... desu.,私の電話番号は…です。,Personal,Statements,,8,
Where do you live?,Doko ni sunde imasu ka?,どこに住んでいますか？,Personal,Questions,,8,
I live in Tokyo.,Toukyou ni sunde imasu.,東京に住んでいます。,Personal,Statements,,8,
Can we take a photo?,Shashin o totte mo ii desu ka?,写真を撮ってもいいですか？,Social,Questions,,8,
Please take our photo.,Shashin o totte kudasai.,写真を撮ってください。,Social,Requests,,8,
May I sit here?,Koko ni suwatte mo ii desu ka?,ここに座ってもいいですか？,Social,Questions,,8,
Please sit here.,Koko ni suwatte kudasai.,ここに座ってください。,Social,Requests,,8,
Congratulations!,Omedetou gozaimasu!,おめでとうございます！,Celebrations,Expressions,,8,
Happy birthday!,O-tanjoubi omedetou!,お誕生日おめでとう！,Celebrations,Expressions,,8,
Good luck!,Ganbatte!,頑張って！,Encouragement,Expressions,,8,
Take care.,Ki o tsukete.,気をつけて。,Encouragement,Expressions,,8,
See you tomorrow.,Mata ashita.,また明日。,Farewells,Time,,8,
See you next week.,Mata raishuu.,また来週。,Farewells,Time,,8,
Long time no see.,O-hisashiburi desu.,お久しぶりです。,Greetings,Reunions,,8,
Welcome!,Youkoso!,ようこそ！,Greetings,Welcoming,,8,
Come in.,O-agari kudasai.,お上がりください。,Hospitality,Requests,,8,
Please relax.,Go-yukkuri kudasai.,ごゆっくりください。,Hospitality,Requests,,8,
Do you have Wi-Fi?,Waifai wa arimasu ka?,Wi-Fiはありますか？,Technology,Questions,,8,
The password is...,Pasuwaado wa ... desu.,パスワードは…です。,Technology,Statements,,8,
Let's begin.,Hajimemashou.,始めましょう。,Meetings,Instructions,,8,
Please wait a moment.,Shoushou omachi kudasai.,少々お待ちください。,Service,Requests,,8,
Thank you for waiting.,O-matase shimashita.,お待たせしました。,Service,Statements,,8,
One moment, please.,Chotto matte kudasai.,ちょっと待ってください。,Service,Requests,,8,
I'm on my way.,Mou sugu ikimasu.,もうすぐ行きます。,Logistics,Statements,,8,
I'll be late.,Chotto okuremasu.,ちょっと遅れます。,Logistics,Statements,,8,
I arrived.,Tsukimashita.,着きました。,Logistics,Statements,,8,
Please open the door.,Doa o akete kudasai.,ドアを開けてください。,Home,Requests,,8,
Please close the door.,Doa o shimete kudasai.,ドアを閉めてください。,Home,Requests,,8,
Turn on the lights.,Denki o tsukete kudasai.,電気をつけてください。,Home,Requests,,8,
Turn off the lights.,Denki o keshite kudasai.,電気を消してください。,Home,Requests,,8,
Where is the bathroom?,Ofuro wa doko desu ka?,お風呂はどこですか？,Home,Questions,,8,
Do you have a laundry machine?,Sentakki wa arimasu ka?,洗濯機はありますか？,Home,Questions,,8,
How do I use this?,Kore wa dou tsukaimasu ka?,これはどう使いますか？,Home,Questions,,8,
Please show me.,Misete kudasai.,見せてください。,Home,Requests,,8,
Is there a supermarket nearby?,Suupaa wa chikaku ni arimasu ka?,スーパーは近くにありますか？,Shopping,Questions,,8,
Where is the pharmacy?,Yakkyoku wa doko desu ka?,薬局はどこですか？,Health,Questions,,8,
Where is the hospital?,Byouin wa doko desu ka?,病院はどこですか？,Health,Questions,,8,
Please call a taxi.,Takushii o yonde kudasai.,タクシーを呼んでください。,Travel,Requests,,8,
I'd like to pay by card.,Kaado de haraitai desu.,カードで払いたいです。,Shopping,Requests,,8,
I'd like to pay in cash.,Genkin de haraitai desu.,現金で払いたいです。,Shopping,Requests,,8,
Could you lower the price?,Mou sukoshi yasuku narimasu ka?,もう少し安くなりますか？,Shopping,Questions,,8,
Can I have a receipt?,Ryoushuusho o moraemasu ka?,領収書をもらえますか？,Shopping,Questions,,8,
Please stamp here.,Koko ni hanko o oshite kudasai.,ここに判子を押してください。,Administration,Requests,,8,
I have a reservation.,Yoyaku shite imasu.,予約しています。,Lodging,Statements,,8,
I don't have a reservation.,Yoyaku shite imasen.,予約していません。,Lodging,Statements,,8,
Please cancel.,Torikeshi o onegai shimasu.,取消をお願いします。,Lodging,Requests,,8,
What is the Wi-Fi speed?,Waifai no hayasa wa dorekurai desu ka?,Wi-Fiの速さはどれくらいですか？,Technology,Questions,,8,
Please lend me this.,Kore o kashite kudasai.,これを貸してください。,Assistance,Requests,,8,
Can you fix this?,Kore o naoshite moraemasu ka?,これを直してもらえますか？,Assistance,Questions,,8,
I forgot.,Wasuremashita.,忘れました。,Conversation,Statements,,8,
I remember.,Omoidashimashita.,思い出しました。,Conversation,Statements,,8,
That's correct.,Sono toori desu.,その通りです。,Conversation,Statements,,8,
That's wrong.,Chigaimasu.,違います。,Conversation,Statements,,8,
Congratulations on your success!,Goukaku omedetou!,合格おめでとう！,Celebrations,Expressions,,8,
Take a rest.,Yasunde kudasai.,休んでください。,Health,Requests,,8,
Please be careful.,Go-chuui kudasai.,ご注意ください。,Safety,Requests,,8,
Watch your step.,Ashimoto ni go-chuui kudasai.,足元にご注意ください。,Safety,Instructions,,8,
No photos, please.,Shashin wa go-enryo kudasai.,写真はご遠慮ください。,Rules,Requests,,8,
No smoking.,Kitsuen kinshi desu.,喫煙禁止です。,Rules,Statements,,8,
Line up here.,Koko ni narande kudasai.,ここに並んでください。,Rules,Instructions,,8,
Wait here.,Koko de omachi kudasai.,ここでお待ちください。,Service,Requests,,8,
Please fill out this form.,Kono furomu o kin'yuu shite kudasai.,このフォームを記入してください。,Administration,Requests,,8,
Sign here, please.,Koko ni shomei shite kudasai.,ここに署名してください。,Administration,Requests,,8,
Enjoy your meal!,Goyukkuri meshiagatte kudasai.,ごゆっくり召し上がってください。,Dining,Hospitality,,8,
Have a nice trip!,Ryokou o tanoshinde kudasai.,旅行を楽しんでください。,Travel,Hospitality,,8,
See you soon.,Mata sugu aimashou.,またすぐ会いましょう。,Farewells,Promising,,8,
Talk to you later.,Mata ato de hanashimashou.,また後で話しましょう。,Conversation,Planning,,8,
Please email me.,Meeru o okutte kudasai.,メールを送ってください。,Communication,Requests,,8,
I'll email you.,Watashi ga meeru o okurimasu.,私がメールを送ります。,Communication,Statements,,8,
Call me.,Denwa shite kudasai.,電話してください。,Communication,Requests,,8,
I'll call you.,Watashi ga denwa shimasu.,私が電話します。,Communication,Statements,,8,
See you online.,Onrain de aimashou.,オンラインで会いましょう。,Technology,Planning,,8,
Let's meet here.,Koko de aimashou.,ここで会いましょう。,Social,Planning,,8,
Let's go.,Ikimashou.,行きましょう。,Social,Planning,,8,
Let's eat.,Tabemashou.,食べましょう。,Dining,Planning,,8,
Let's drink.,Nomimashou.,飲みましょう。,Dining,Planning,,8,
Let's start.,Hajimeyou.,始めよう。,Meetings,Instructions,,8,
Let's finish.,Owarimashou.,終わりましょう。,Meetings,Instructions,,8,
Please enjoy.,Tanoshinde kudasai.,楽しんでください。,Hospitality,Requests,,8,
Please forgive me.,Yurushite kudasai.,許してください。,Apologies,Requests,,8,
I'm worried.,Shinpai shite imasu.,心配しています。,Feelings,Statements,,8,
I'm relieved.,Anshin shimashita.,安心しました。,Feelings,Statements,,8,
I'm excited.,Wakuwaku shite imasu.,ワクワクしています。,Feelings,Statements,,8,
I'm nervous.,Kincho shite imasu.,緊張しています。,Feelings,Statements,,8,
I'm happy.,Ureshii desu.,嬉しいです。,Feelings,Statements,,8,
I'm sad.,Kanashii desu.,悲しいです。,Feelings,Statements,,8,
I'm angry.,Okotte imasu.,怒っています。,Feelings,Statements,,8,
It's fun.,Tanoshii desu.,楽しいです。,Conversation,Statements,,8,
It's boring.,Tsumaranai desu.,つまらないです。,Conversation,Statements,,8,
It's difficult.,Muzukashii desu.,難しいです。,Conversation,Statements,,8,
It's easy.,Kantan desu.,簡単です。,Conversation,Statements,,8,
Do you like it?,Suki desu ka?,好きですか？,Conversation,Questions,,8,
I like it.,Suki desu.,好きです。,Conversation,Statements,,8,
I don't like it.,Suki ja nai desu.,好きじゃないです。,Conversation,Statements,,8,
That's great!,Sugoine!,すごいね！,Encouragement,Expressions,,8,
That's terrible.,Hidoi desu.,ひどいです。,Conversation,Statements,,8,
Please wait outside.,Soto de omachi kudasai.,外でお待ちください。,Service,Requests,,8,
Please come inside.,O hairi kudasai.,お入りください。,Hospitality,Requests,,8,
Close early.,Hayaku shimete kudasai.,早く閉めてください。,Service,Requests,,8,
Open early.,Hayaku akete kudasai.,早く開けてください。,Service,Requests,,8,
I'll think about it.,Kangaete okimasu.,考えておきます。,Conversation,Statements,,8,
I decided.,Kimarimashita.,決まりました。,Conversation,Statements,,8,
Maybe.,Tabun desu.,多分です。,Conversation,Statements,,8,
I'm not sure.,Yoku wakarimasen.,よく分かりません。,Conversation,Statements,,8,
Please call me later.,Ato de denwa shite kudasai.,後で電話してください。,Communication,Requests,,8,
I'll contact you.,Renraku shimasu.,連絡します。,Communication,Statements,,8,
Please confirm.,Kakunin shite kudasai.,確認してください。,Administration,Requests,,8,
Confirmed.,Kakunin shimashita.,確認しました。,Administration,Statements,,8,
Please deliver this.,Kore o todokete kudasai.,これを届けてください。,Logistics,Requests,,8,
It has arrived.,Todokimashita.,届きました。,Logistics,Statements,,8,
It's delayed.,Okurete imasu.,遅れています。,Logistics,Statements,,8,
No problem.,Mondai arimasen.,問題ありません。,Responses,Assurance,,8,
There is a problem.,Mondai ga arimasu.,問題があります。,Responses,Alerts,,8,
That's impossible.,Muri desu.,無理です。,Responses,Statements,,8,
That's possible.,Dekimasu.,できます。,Responses,Statements,,8,
Please be quiet.,Shizuka ni shite kudasai.,静かにしてください。,Rules,Requests,,8,
Be quiet, please.,Shizuka ni onegai shimasu.,静かにお願いします。,Rules,Requests,,8,
Let's practice.,Renshuu shimashou.,練習しましょう。,Education,Instructions,,8,
Practice more.,Motto renshuu shite kudasai.,もっと練習してください。,Education,Requests,,8,
Great job!,Yoku dekimashita!,よくできました！,Encouragement,Expressions,,8,
Please focus.,Shuuchuu shite kudasai.,集中してください。,Education,Requests,,8,
Focus here.,Koko ni shuuchuu shite kudasai.,ここに集中してください。,Education,Requests,,8,
Keep trying.,Akiramenaide kudasai.,諦めないでください。,Encouragement,Requests,,8,
Almost there.,Mou sukoshi desu.,もう少しです。,Encouragement,Statements,,8,
Take a deep breath.,Fukaku iki o shite kudasai.,深く息をしてください。,Health,Instructions,,8,
Relax.,Rirakkusu shite kudasai.,リラックスしてください。,Health,Instructions,,8,
Calm down.,Ochitsuite kudasai.,落ち着いてください。,Health,Instructions,,8,
Smile!,Egao de!,笑顔で！,Encouragement,Expressions,,8,
Don't worry.,Shinpai shinaide kudasai.,心配しないでください。,Encouragement,Requests,,8,
Let's celebrate.,O-iwai shimashou.,お祝いしましょう。,Celebrations,Planning,,8,
Well done.,Otsukaresama desu.,お疲れ様です。,Encouragement,Expressions,,8,
Good work today.,Kyou mo otsukaresama deshita.,今日もお疲れ様でした。,Encouragement,Expressions,,8,
Thank you for your help.,Tetsudatte kurete arigatou.,手伝ってくれてありがとう。,Gratitude,Assistance,,8,
You're welcome.,Douitashimashite.,どういたしまして。,Gratitude,Responses,,8,
Let's keep in touch.,Mata renraku shimashou.,また連絡しましょう。,Communication,Planning,,8,
Safe travels.,Gokenkou de.,ご健康で。,Travel,Well Wishes,,8,
Get well soon.,Hayaku genki ni natte kudasai.,早く元気になってください。,Health,Well Wishes,,8,
Cheers for your hard work!,Otsukaresama!,お疲れ様！,Encouragement,Expressions,,8,
Thank you very much for everything.,Iroiro to arigatou gozaimashita.,いろいろとありがとうございました。,Gratitude,Formal,,8,
Please come again.,Mata kite kudasai.,また来てください。,Hospitality,Requests,,8,
See you next time.,Mata kondo.,また今度。,Farewells,Planning,,8,
`;

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = parseLine(lines.shift());
  return lines
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const values = parseLine(line);
      const entry = {};
      headers.forEach((header, i) => {
        entry[header] = values[i] ?? '';
      });
      return {
        id: `card-${index + 1}`,
        english: entry['english']?.trim() ?? '',
        romaji: entry['romaji']?.trim() ?? '',
        japanese: entry['japanese']?.trim() ?? '',
        usefulness: Number(entry['usefulness']) || null,
        tags: [entry['tags/0'], entry['tags/1'], entry['tags/2'], entry['tags/3']]
          .map((tag) => (tag ? tag.trim() : ''))
          .filter(Boolean)
      };
    });
}

function parseLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((value) => value.trim());
}

const cards = parseCSV(RAW_DATA);
const cardMap = new Map(cards.map((card) => [card.id, card]));

const MASTER_DECK_ID = 'master';

function computeChunkSizes(total, min = 40, max = 50) {
  if (total <= 0) return [];
  const minDecks = Math.ceil(total / max);
  const maxDecks = Math.max(minDecks, Math.ceil(total / min));
  for (let deckCount = minDecks; deckCount <= maxDecks; deckCount += 1) {
    const sizes = Array(deckCount).fill(min);
    let remainder = total - deckCount * min;
    if (remainder < 0) continue;
    for (let i = 0; i < deckCount && remainder > 0; i += 1) {
      const allowance = max - sizes[i];
      const addition = Math.min(allowance, remainder);
      sizes[i] += addition;
      remainder -= addition;
    }
    if (remainder === 0) {
      return sizes.filter((size) => size > 0);
    }
  }
  return [total];
}

function loadJSON(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to parse stored data for', key, error);
    return null;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save data for', key, error);
  }
}

function createDefaultDecks() {
  const deckMap = new Map();
  deckMap.set(MASTER_DECK_ID, {
    id: MASTER_DECK_ID,
    name: 'Master Deck',
    cardIds: cards.map((card) => card.id)
  });

  const sorted = [...cards].sort((a, b) => {
    const tagA = a.tags[0] ?? 'zzz';
    const tagB = b.tags[0] ?? 'zzz';
    if (tagA === tagB) {
      return a.english.localeCompare(b.english);
    }
    return tagA.localeCompare(tagB);
  });

  const sizes = computeChunkSizes(sorted.length);
  let index = 0;
  sizes.forEach((size, chunkIndex) => {
    const chunkCards = sorted.slice(index, index + size);
    index += size;
    if (!chunkCards.length) return;
    const tagFrequency = new Map();
    chunkCards.forEach((card) => {
      card.tags.forEach((tag) => {
        tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
      });
    });
    const topTags = [...tagFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([tag]) => tag)
      .filter(Boolean);
    const deckId = `deck-${chunkIndex + 1}`;
    const nameSuffix = topTags.length ? topTags.join(' & ') : `Set ${chunkIndex + 1}`;
    deckMap.set(deckId, {
      id: deckId,
      name: `Deck ${chunkIndex + 1}: ${nameSuffix}`,
      cardIds: chunkCards.map((card) => card.id)
    });
  });

  const order = [...deckMap.keys()];
  return { decks: Object.fromEntries(deckMap.entries()), order };
}

let decksState = loadJSON(STORAGE_KEYS.decks);
let deckOrder = loadJSON(STORAGE_KEYS.order);

if (!decksState || !deckOrder) {
  const defaults = createDefaultDecks();
  decksState = defaults.decks;
  deckOrder = defaults.order;
  saveJSON(STORAGE_KEYS.decks, decksState);
  saveJSON(STORAGE_KEYS.order, deckOrder);
}

let srsState = loadJSON(STORAGE_KEYS.srs) ?? {};

function persistDecks() {
  saveJSON(STORAGE_KEYS.decks, decksState);
  saveJSON(STORAGE_KEYS.order, deckOrder);
}

function persistSrs() {
  saveJSON(STORAGE_KEYS.srs, srsState);
}

function ensureDeckExists(deckId) {
  if (!decksState[deckId]) {
    decksState[deckId] = { id: deckId, name: 'New Deck', cardIds: [] };
  }
}

function getDeck(deckId) {
  ensureDeckExists(deckId);
  return decksState[deckId];
}

function getDeckCardIds(deckId) {
  return getDeck(deckId).cardIds;
}

function getCardState(deckId, cardId) {
  return srsState[deckId]?.[cardId] ?? null;
}

function updateCardState(deckId, cardId, updater) {
  const deckState = srsState[deckId] ?? {};
  const current = deckState[cardId] ?? null;
  const updated = updater(current);
  srsState[deckId] = { ...deckState, [cardId]: updated };
  persistSrs();
  return updated;
}

function removeCardState(deckId, cardId) {
  if (srsState[deckId]?.[cardId]) {
    delete srsState[deckId][cardId];
    persistSrs();
  }
}

function computeDeckBreakdown(deckId) {
  const now = Date.now();
  const cardIds = getDeckCardIds(deckId);
  let due = 0;
  let fresh = 0;
  let later = 0;
  cardIds.forEach((cardId) => {
    const state = getCardState(deckId, cardId);
    if (!state) {
      fresh += 1;
    } else if (state.due <= now) {
      due += 1;
    } else {
      later += 1;
    }
  });
  return { total: cardIds.length, due, fresh, later };
}

function getReviewQueue(deckId) {
  const now = Date.now();
  const due = [];
  const fresh = [];
  getDeckCardIds(deckId).forEach((cardId) => {
    const state = getCardState(deckId, cardId);
    if (!state) {
      fresh.push({ cardId, due: now });
    } else if (state.due <= now) {
      due.push({ cardId, due: state.due });
    }
  });
  due.sort((a, b) => a.due - b.due);
    fresh.sort((a, b) => {
      const cardA = cardMap.get(a.cardId);
      const cardB = cardMap.get(b.cardId);
      const englishA = cardA?.english ?? '';
      const englishB = cardB?.english ?? '';
      return englishA.localeCompare(englishB);
    });
  return [...due, ...fresh];
}

function formatDueDate(timestamp) {
  const delta = timestamp - Date.now();
  if (delta <= 0) return 'Available now';
  const minutes = Math.max(1, Math.round(delta / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(hours < 10 ? 1 : 0)} hr`;
  const days = hours / 24;
  if (days < 7) return `${days.toFixed(days < 3 ? 1 : 0)} days`;
  const weeks = days / 7;
  return `${weeks.toFixed(weeks < 3 ? 1 : 0)} weeks`;
}

function scheduleCard(deckId, cardId, grade) {
  const now = Date.now();
  return updateCardState(deckId, cardId, (current) => {
    const state = current
      ? { ...current }
      : { ease: 2.5, interval: 0, repetitions: 0, lapses: 0, due: now };

    const qualityMap = {
      again: 1,
      hard: 2,
      good: 3,
      easy: 4
    };
    const quality = qualityMap[grade] ?? 3;

  if (quality < 2) {
    state.repetitions = 0;
    state.interval = quality === 1 ? 0.007 : 1;
    state.ease = Math.max(1.3, (state.ease ?? 2.5) - 0.2);
    state.lapses = (state.lapses ?? 0) + 1;
  } else {
      const ease = state.ease ?? 2.5;
      let newEase = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      newEase = Math.max(1.3, newEase);
      state.ease = newEase;
      if (state.repetitions === 0) {
        state.interval = grade === 'easy' ? 3 : 1;
      } else if (state.repetitions === 1) {
        state.interval = grade === 'easy' ? 8 : 6;
      } else {
        state.interval = Math.round(state.interval * newEase);
      }
      if (grade === 'hard') {
        state.interval = Math.max(1, Math.round(state.interval * 0.6));
      }
      if (grade === 'easy') {
        state.interval = Math.round(state.interval * 1.3);
      }
      state.repetitions += 1;
    }

    const intervalMs = state.interval * 24 * 60 * 60 * 1000;
    state.due = now + Math.max(intervalMs, 10 * 60 * 1000);
    state.lastGrade = grade;
    return state;
  });
}

const dom = {
  deckSelect: document.querySelector('#deckSelect'),
  startReview: document.querySelector('#startReview'),
  resetState: document.querySelector('#resetState'),
  cardDisplay: document.querySelector('#cardDisplay'),
  cardFront: document.querySelector('#cardFront .card-content.english'),
  cardBackRomaji: document.querySelector('#cardBack .card-content.romaji'),
  cardBackJapanese: document.querySelector('#cardBack .card-content.japanese'),
  cardTags: document.querySelector('#cardBack .card-tags'),
  flipCard: document.querySelector('#flipCard'),
  answerPanel: document.querySelector('#answerPanel'),
  gradeButtons: document.querySelectorAll('.grade'),
  nextInfo: document.querySelector('#nextInfo'),
  sessionSummary: document.querySelector('#sessionSummary'),
  deckList: document.querySelector('#deckList'),
  deckListTemplate: document.querySelector('#deckListItem'),
  deckOrderContainer: document.querySelector('#deckOrder'),
  deckOrderTemplate: document.querySelector('#deckOrderItem'),
  deckOverview: document.querySelector('#deckOverview'),
  newDeckName: document.querySelector('#newDeckName'),
  addDeck: document.querySelector('#addDeck'),
  assignmentDeckSelect: document.querySelector('#assignmentDeckSelect'),
  cardSearch: document.querySelector('#cardSearch'),
  cardBrowser: document.querySelector('#cardBrowser'),
  cardBrowserTemplate: document.querySelector('#cardBrowserItem'),
  assignSelected: document.querySelector('#assignSelected'),
  removeSelected: document.querySelector('#removeSelected'),
  voiceSelect: document.querySelector('#voiceSelect'),
  romajiSpeakButton: document.querySelector('#cardBack .speak[data-target="romaji"]'),
  japaneseSpeakButton: document.querySelector('#cardBack .speak[data-target="japanese"]'),
  speakButtons: document.querySelectorAll('.speak')
};

let currentSession = null;

function renderDeckSelect() {
  const previousReviewSelection = dom.deckSelect.value;
  const previousAssignmentSelection = dom.assignmentDeckSelect.value;
  dom.deckSelect.innerHTML = '';
  deckOrder.forEach((deckId) => {
    const deck = decksState[deckId];
    if (!deck) return;
    const breakdown = computeDeckBreakdown(deckId);
    const option = document.createElement('option');
    option.value = deckId;
    const dueLabel = breakdown.due > 0 ? ` · Due ${breakdown.due}` : '';
    const newLabel = breakdown.fresh > 0 ? ` · New ${breakdown.fresh}` : '';
    option.textContent = `${deck.name}${dueLabel}${newLabel}`;
    if (deckId === previousReviewSelection) {
      option.selected = true;
    }
    dom.deckSelect.appendChild(option);
  });
  dom.assignmentDeckSelect.innerHTML = '';
  deckOrder.forEach((deckId) => {
    const option = document.createElement('option');
    option.value = deckId;
    option.textContent = decksState[deckId]?.name ?? deckId;
    if (deckId === previousAssignmentSelection) {
      option.selected = true;
    }
    dom.assignmentDeckSelect.appendChild(option);
  });
  if (!dom.deckSelect.value && deckOrder.length) {
    dom.deckSelect.value = deckOrder[0];
  }
  if (!dom.assignmentDeckSelect.value && deckOrder.length) {
    dom.assignmentDeckSelect.value = deckOrder[0];
  }
}

function renderDeckList() {
  dom.deckList.innerHTML = '';
  deckOrder.forEach((deckId) => {
    const deck = decksState[deckId];
    if (!deck) return;
    const breakdown = computeDeckBreakdown(deckId);
    const fragment = dom.deckListTemplate.content.cloneNode(true);
    const article = fragment.querySelector('.deck-card');
    article.dataset.deckId = deckId;
    fragment.querySelector('h3').textContent = deck.name;
    fragment.querySelector('.deck-meta').textContent = `${breakdown.total} cards · ${breakdown.fresh} new · ${breakdown.due} due`;
    fragment.querySelector('.deck-status').textContent = breakdown.due
      ? `Ready: ${breakdown.due} cards waiting`
      : 'No cards due right now';

    const renameBtn = fragment.querySelector('.rename');
    renameBtn.disabled = deckId === MASTER_DECK_ID;
    renameBtn.addEventListener('click', () => handleRenameDeck(deckId));

    const deleteBtn = fragment.querySelector('.delete');
    deleteBtn.disabled = deckId === MASTER_DECK_ID;
    deleteBtn.addEventListener('click', () => handleDeleteDeck(deckId));

    dom.deckList.appendChild(fragment);
  });
}

function renderDeckOrder() {
  dom.deckOrderContainer.innerHTML = '';
  deckOrder.forEach((deckId, index) => {
    const deck = decksState[deckId];
    if (!deck) return;
    const node = dom.deckOrderTemplate.content.cloneNode(true);
    const container = node.querySelector('.order-item');
    container.dataset.deckId = deckId;
    container.querySelector('.name').textContent = deck.name;
    const up = container.querySelector('.move-up');
    const down = container.querySelector('.move-down');
    up.disabled = index === 0;
    down.disabled = index === deckOrder.length - 1;
    up.addEventListener('click', () => moveDeck(deckId, -1));
    down.addEventListener('click', () => moveDeck(deckId, 1));
    dom.deckOrderContainer.appendChild(node);
  });
}

function renderCardBrowser() {
  const selectedDeckId = dom.assignmentDeckSelect.value || deckOrder[0];
  const deck = decksState[selectedDeckId];
  dom.cardBrowser.innerHTML = '';
  const filter = dom.cardSearch.value?.toLowerCase() ?? '';
  const filtered = cards.filter((card) => {
    if (!filter) return true;
    const searchIn = [card.english, card.romaji, card.japanese, card.tags.join(' ')].join(' ').toLowerCase();
    return searchIn.includes(filter);
  });
  filtered.forEach((card) => {
    const fragment = dom.cardBrowserTemplate.content.cloneNode(true);
    const row = fragment.querySelector('.card-row');
    row.dataset.cardId = card.id;
    row.querySelector('.english').textContent = card.english;
    row.querySelector('.romaji').textContent = card.romaji;
    row.querySelector('.tags').textContent = card.tags.join(' · ');
    const badge = row.querySelector('.badge');
    if (deck?.cardIds.includes(card.id)) {
      row.classList.add('in-deck');
      badge.hidden = false;
    } else {
      row.classList.remove('in-deck');
      badge.hidden = true;
    }
    dom.cardBrowser.appendChild(fragment);
  });
}

function moveDeck(deckId, direction) {
  const index = deckOrder.indexOf(deckId);
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= deckOrder.length) return;
  deckOrder.splice(index, 1);
  deckOrder.splice(newIndex, 0, deckId);
  persistDecks();
  renderDeckSelect();
  renderDeckList();
  renderDeckOrder();
}

function handleRenameDeck(deckId) {
  const currentName = decksState[deckId]?.name ?? '';
  const nextName = prompt('Rename deck', currentName)?.trim();
  if (!nextName) return;
  decksState[deckId].name = nextName;
  persistDecks();
  renderDeckSelect();
  renderDeckList();
  renderDeckOrder();
}

function handleDeleteDeck(deckId) {
  if (deckId === MASTER_DECK_ID) return;
  const confirmed = confirm('Delete this deck? Progress for it will also be removed.');
  if (!confirmed) return;
  delete decksState[deckId];
  deckOrder = deckOrder.filter((id) => id !== deckId);
  delete srsState[deckId];
  persistDecks();
  persistSrs();
  renderDeckSelect();
  renderDeckList();
  renderDeckOrder();
  renderCardBrowser();
}

function handleAddDeck() {
  const name = dom.newDeckName.value.trim();
  if (!name) return;
  const id = `deck-${Date.now()}`;
  decksState[id] = { id, name, cardIds: [] };
  deckOrder.push(id);
  dom.newDeckName.value = '';
  persistDecks();
  renderDeckSelect();
  renderDeckList();
  renderDeckOrder();
  renderCardBrowser();
  dom.assignmentDeckSelect.value = id;
}

function handleAssignment(action) {
  const deckId = dom.assignmentDeckSelect.value;
  const deck = decksState[deckId];
  if (!deck) return;
  const selectedIds = Array.from(dom.cardBrowser.querySelectorAll('input[type="checkbox"]:checked')).map(
    (input) => {
      const id = input.closest('.card-row')?.dataset.cardId;
      input.checked = false;
      return id;
    }
  ).filter(Boolean);
  if (!selectedIds.length) return;

  if (action === 'add') {
    const existing = new Set(deck.cardIds);
    selectedIds.forEach((id) => existing.add(id));
    deck.cardIds = Array.from(existing);
  } else if (action === 'remove' && deckId !== MASTER_DECK_ID) {
    const removeSet = new Set(selectedIds);
    deck.cardIds = deck.cardIds.filter((id) => {
      if (removeSet.has(id)) {
        removeCardState(deckId, id);
        return false;
      }
      return true;
    });
  }
  persistDecks();
  renderDeckSelect();
  renderDeckList();
  renderCardBrowser();
}

function resetProgress() {
  if (!confirm('Reset spaced repetition progress and decks to defaults?')) return;
  localStorage.removeItem(STORAGE_KEYS.decks);
  localStorage.removeItem(STORAGE_KEYS.order);
  localStorage.removeItem(STORAGE_KEYS.srs);
  localStorage.removeItem(STORAGE_KEYS.voices);
  const defaults = createDefaultDecks();
  decksState = defaults.decks;
  deckOrder = defaults.order;
  srsState = {};
  renderDeckSelect();
  renderDeckList();
  renderDeckOrder();
  renderCardBrowser();
  clearSession();
}

function clearSession(message) {
  currentSession = null;
  dom.cardDisplay.classList.remove('show-back');
  dom.cardFront.textContent = '';
  dom.cardBackRomaji.textContent = '';
  dom.cardBackJapanese.textContent = '';
  if (dom.romajiSpeakButton) {
    dom.romajiSpeakButton.disabled = true;
  }
  if (dom.japaneseSpeakButton) {
    dom.japaneseSpeakButton.disabled = true;
  }
  dom.cardTags.textContent = '';
  dom.flipCard.disabled = true;
  dom.answerPanel.hidden = true;
  dom.sessionSummary.hidden = !message;
  dom.sessionSummary.innerHTML = message ?? '';
}

function startReview() {
  const deckId = dom.deckSelect.value;
  if (!deckId) return;
  const queue = getReviewQueue(deckId);
  if (!queue.length) {
    clearSession('<p>No cards are due right now. Try again later or add more cards to this deck.</p>');
    return;
  }
  currentSession = {
    deckId,
    queue,
    position: 0,
    stats: { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 }
  };
  dom.sessionSummary.hidden = true;
  showCurrentCard();
}

function showCurrentCard() {
  if (!currentSession) return;
  const entry = currentSession.queue[currentSession.position];
  if (!entry) {
    endSession();
    return;
  }
  const card = cardMap.get(entry.cardId);
  dom.cardDisplay.dataset.cardId = entry.cardId;
  dom.cardDisplay.classList.remove('show-back');
  const englishText = card.english ?? '';
  const romajiText = (card.romaji ?? '').trim();
  const japaneseText = (card.japanese ?? '').trim();

  dom.cardFront.textContent = englishText;
  dom.cardBackRomaji.textContent = romajiText;
  dom.cardBackJapanese.textContent = japaneseText;
  const canSpeak = 'speechSynthesis' in window;
  if (dom.romajiSpeakButton) {
    dom.romajiSpeakButton.disabled = !canSpeak || !romajiText;
  }
  if (dom.japaneseSpeakButton) {
    dom.japaneseSpeakButton.disabled = !canSpeak || !japaneseText;
  }
  dom.cardTags.textContent = card.tags.join(' · ');
  dom.flipCard.disabled = false;
  dom.answerPanel.hidden = true;
  dom.nextInfo.textContent = '';
}

function flipCard() {
  if (!currentSession) return;
  dom.cardDisplay.classList.toggle('show-back');
  const isBack = dom.cardDisplay.classList.contains('show-back');
  dom.answerPanel.hidden = !isBack;
}

function gradeCard(event) {
  if (!currentSession) return;
  const grade = event.currentTarget.dataset.grade;
  const entry = currentSession.queue[currentSession.position];
  const card = cardMap.get(entry.cardId);
  const state = scheduleCard(currentSession.deckId, entry.cardId, grade);
  currentSession.stats.reviewed += 1;
  currentSession.stats[grade] += 1;
  const dueText = formatDueDate(state.due);
  dom.nextInfo.textContent =
    dueText === 'Available now'
      ? `${card.english} is scheduled to repeat immediately.`
      : `${card.english} will return in ${dueText}.`;
  setTimeout(() => {
    advanceQueue();
  }, 450);
}

function advanceQueue() {
  if (!currentSession) return;
  currentSession.queue.splice(currentSession.position, 1);
  if (!currentSession.queue.length) {
    endSession();
    renderDeckSelect();
    renderDeckList();
    return;
  }
  if (currentSession.position >= currentSession.queue.length) {
    currentSession.position = 0;
  }
  dom.cardDisplay.classList.remove('show-back');
  dom.answerPanel.hidden = true;
  showCurrentCard();
  renderDeckSelect();
  renderDeckList();
}

function endSession() {
  if (!currentSession) return;
  const { stats } = currentSession;
  clearSession(`<h3>Session complete!</h3>
  <p>You reviewed <strong>${stats.reviewed}</strong> cards.</p>
  <ul>
    <li>Again: ${stats.again}</li>
    <li>Hard: ${stats.hard}</li>
    <li>Good: ${stats.good}</li>
    <li>Easy: ${stats.easy}</li>
  </ul>`);
  renderDeckSelect();
  renderDeckList();
}

function handleVoiceOptions() {
  if (!('speechSynthesis' in window)) {
    dom.voiceSelect.disabled = true;
    dom.speakButtons.forEach((btn) => btn.setAttribute('disabled', 'disabled'));
    return;
  }
  const stored = loadJSON(STORAGE_KEYS.voices) ?? {};
  const updateVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    const jaVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('ja'));

    dom.voiceSelect.innerHTML = '';
    dom.voiceSelect.disabled = !jaVoices.length;

    const createOption = (voice) => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      return option;
    };

    if (!jaVoices.length) {
      const option = document.createElement('option');
      option.textContent = 'No voices detected';
      option.value = '';
      option.disabled = true;
      option.selected = true;
      dom.voiceSelect.appendChild(option);
      return;
    }

    jaVoices.forEach((voice) => {
      const option = createOption(voice);
      if (voice.name === stored.jaVoice) {
        option.selected = true;
      }
      dom.voiceSelect.appendChild(option);
    });
  };

  updateVoices();
  window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

  dom.voiceSelect.addEventListener('change', () => {
    const selection = {
      jaVoice: dom.voiceSelect.value || null
    };
    saveJSON(STORAGE_KEYS.voices, selection);
  });
}

function speakText(text, { lang, preferredName }) {
  if (!('speechSynthesis' in window) || !text) return;
  const content = text.trim();
  if (!content) return;
  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = lang;
  const voices = window.speechSynthesis.getVoices();
  if (preferredName) {
    const match = voices.find((voice) => voice.name === preferredName);
    if (match) {
      utterance.voice = match;
    }
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function setupSpeechButtons() {
  if (!('speechSynthesis' in window)) return;
  dom.speakButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      if (!target) return;
      const stored = loadJSON(STORAGE_KEYS.voices) ?? {};
      let speechText = '';
      if (target === 'romaji') {
        speechText = dom.cardBackRomaji.textContent;
      } else if (target === 'japanese') {
        speechText = dom.cardBackJapanese.textContent;
      }
      if (!speechText) return;
      speakText(speechText, { lang: 'ja-JP', preferredName: stored.jaVoice });
    });
  });
}

function init() {
  renderDeckSelect();
  renderDeckList();
  renderDeckOrder();
  renderCardBrowser();
  handleVoiceOptions();
  setupSpeechButtons();

  dom.startReview.addEventListener('click', startReview);
  dom.resetState.addEventListener('click', resetProgress);
  dom.flipCard.addEventListener('click', flipCard);
  dom.deckSelect.addEventListener('change', () => {
    if (currentSession && !confirm('Switch deck and abandon the current session?')) {
      dom.deckSelect.value = currentSession.deckId;
      return;
    }
    clearSession();
  });
  dom.addDeck.addEventListener('click', handleAddDeck);
  dom.assignmentDeckSelect.addEventListener('change', renderCardBrowser);
  dom.cardSearch.addEventListener('input', renderCardBrowser);
  dom.assignSelected.addEventListener('click', () => handleAssignment('add'));
  dom.removeSelected.addEventListener('click', () => handleAssignment('remove'));
  dom.gradeButtons.forEach((button) => button.addEventListener('click', gradeCard));
}

init();
