const STORAGE_VERSION = 'v1';
const STORAGE_KEYS = {
  decks: `ankiDecks-${STORAGE_VERSION}`,
  order: `ankiDeckOrder-${STORAGE_VERSION}`,
  srs: `ankiSrs-${STORAGE_VERSION}`,
  voices: `ankiVoices-${STORAGE_VERSION}`
};

const RAW_DATA = `english,romaji,japanese,tags/0,tags/1,tags/2,usefulness,tags/3
"No, I can’t eat it.","Iie, taberaremasen.",いいえ、食べられません。,Common Responses,Negation / Inability,Lack of Understanding,8,Communication Help
No I don’t. (speak),Hanashimasen.,話しません。,Common Responses,Negation / Inability,Requests,8,Vocabulary
What would you like?,Dore ni shimasu ka.,どれにしますか？,Ordering,Shopping & Restaurants,,8,
Excuse me. (polite form),Shitsurei shimasu.,失礼します。,Formal,Farewells,,8,
I don't understand what this Japanese means.,Kono nihongo wa wakarimasen.,この日本語は分かりません。,Lack of Understanding,Communication Help,,8,
"Say it again, please.","Mo ichido, kudasi.",もう一度、プリーズ。,Repetition,Communication Help,,8,
"Say slowly, please.","Yukkuri, please.",ゆっくり、プリーズ。,Pace,Communication Help,,8,
"Welcome. (shorter, casual form)",Irasshai.,いらっしゃい。,Greeting Customers,Shopping & Restaurants,,8,
Thank you very much (for having shopped here.),Arigato gozaimashita.,ありがとうございました。,Shopping & Restaurants,Thanking Customers,,8,
Good evening. May I help you?,Konbanwa. Irasshaimase.,こんばんは。いらっしゃいませ。,Greeting Customers,Shopping & Restaurants,,8,
"Are you ready to order, sir/ma'am?","O-kyaku-sama, go-chumon wa?",お客様、ご注文は？,Ordering,At a Restaurant,,8,
"Which do you prefer, smoking or non-smoking?","Kin'en, kitsuen, dochira ni shimasu ka?",禁煙、喫煙、どちらにしますか？,Greeting & Seating,At a Restaurant,,8,
I don't want to sit in the smoking section.,Kitsuenseki ni suwaritakunai desu.,喫煙席に座りたくないです。,Stating Preferences,At a Restaurant,,8,
What are you ordering?,Go-chumon wa?,ご注文は？,Ordering,At a Restaurant,,8,
What would you like to drink?,Nani o nomimasu ka.,何を飲みますか。,Ordering,At a Restaurant,,8,
Thank you for the wonderful meal.,Gochisosama deshita.,ごちそうさまでした。,After the Meal,At a Restaurant,,8,
I am about to have this wonderful meal.,Itadakimasu.,いただきます。,Before the Meal,At a Restaurant,,8,
It was delicious.,Oishikatta.,おいしかった。,Descriptions,Food,,8,
"One glass of beer and one glass of sake, please.","Bīru nihai to, osake nihai wo kudasai.",ビール七杯と、酒八杯をください。,Counting,Food & Drink,,8,
How much is the change?,Otsuri wa ikura desu ka.,お釣りはいくらですか？,Shopping & Money,Paying,,8,
"Six, ten, eight (68).",Roku-ju-hachi.,六十八。,Numbers,Money,,8,
Five hundred.,Go-hyaku.,五百。,Numbers,Money,,8,
Three hundred.,San-byaku.,三百。,Numbers,Money,,8,
Six hundred.,Ro-ppyaku.,六百。,Numbers,Money,,8,
Eight hundred.,Ha-ppyaku.,八百。,Numbers,Money,,8,
How do I access the Internet?,Netto ni wa do yatte setsuzoku shimasu ka?,ネットにはどうやって接続しますか？,Access,Internet & Technology,,8,
Internet.,Intanetto.,インターネット。,Internet & Technology,Vocabulary,,8,
Turn right at the convenience store.,Konbini de migi ni magaru.,そして、まっすぐ行きます。,Instructions,Directions,,8,
Please turn left.,Hidari ni magatte kudasai.,写真を撮ってください。,Social,Photos,,8,
What is this?,Kore wa nan desu ka.,コールドは日本語で。,Translation,Language Help,,8,
How is the taste?,Aji wa do desu ka.,日本語では？,Translation,Language Help,,8,
How do you say this in Japanese?,Kore wa nihongo de do imasu ka.,書いてください。,Writing,Language Help,,8,
Cold,Kōrudo,ローマ字で書いてください。,Writing,Language Help,,8,
What does this mean?,Kore wa doiu imi desu ka.,アイロンはありますか？,At the Hotel,Amenities,,8,
I don't understand what you mean.,Imi ga wakarimasen.,インターネットをしてもいいですか？,At the Hotel,Services,,8,
Can I use the internet?,Intanetto o shitemo i desu ka.,ルームサービスはありますか？,At the Hotel,Services,,8,
Do you have room service?,Rumusabisu wa arimasu ka?,コーヒーはありますか？,At the Hotel,Food,,8,
Do you have tempura?,Tempura wa arimasu ka?,ランドリーサービスはありますか？,At the Hotel,Services,,8,
Do you have coffee?,Kohi wa arimasu ka?,ルームサービスをお願いします。,At the Hotel,Services,,8,
Do you have laundry service?,Randori sabisu wa arimasu ka?,ランドリーサービスをお願いします。,At the Hotel,Services,,8,
It's five thousand yen.,Go sen-en desu.,シニア四名ください。,Counting,People,,8,
"Four senior tickets, please.",Shinia yon-mei kudasai.,スパイダーマン大人二名。,Counting,People,,8,
Do you have an English information guide?,Eigo no gaido wa arimasu ka?,食べ方は？,Asking How to Eat,Food,,8,
Dip it in the broth.,Tsuyu ni tsukeru.,この食べ方を教えてください。,Asking How to Eat,Food,,8,
Put mayonnaise on it.,Mayonezu o tsukeru.,ソースはどこにありますか。,Condiments,Food,,8,
Pour sauce on it.,Sosu o kakeru.,胡椒をとってください。,Condiments,Food,,8,
Could you pass me the pepper?,Kosho wo totte kudasai.,醤油をとってください。,Condiments,Food,,8,
I love mayonnaise.,Mayonezu ga daisuki desu.,肉は食べません。魚は食べます。,Restrictions,Dietary Needs,,8,
This is meat.,Kore wa niku desu.,食べません。,Restrictions,Dietary Needs,,8,
Pleased to meet you.,Yoroshiku onegai shimasu.,私の名前は...,Emergency,Providing Information,,8,
There's a fire! Please call 119.,Kaji desu. 119ban wo onegai shimasu.,住所は...,Emergency,Providing Information,,8,
Where is the pharmacy?,Yakkyoku wa doko desu ka?,風邪をひいています。,Illness,Health,,8,
My stomach hurts.,Onaka ga itai desu.,熱があります。,Symptoms,Health,,8,
My head hurts.,Atama ga itai desu.,喉が痛いです。,Health,Pain / Ailments,,8,
I have a cold.,Kaze o hiite imasu.,胸が痛いです。,Health (Body Parts),Pain,,8,
I have a fever.,Netsu ga arimasu.,お腹を壊した。,Illness,Health,,8,
I got an upset stomach.,O-naka o kowashita.,目が痒いです。,Health (Body Parts),Face,,8,
My eyes are itchy.,Me ga kayui desu.,喉飴をください。,Medicine,Health (Pharmacy),,8,
My forehead hurts.,Hitai ga itai desu.,花粉症です。,Symptoms,Health (Allergies),,8,
Rice small serving.,Raisu sukuname.,そうです。,Common Responses,Agreement,,8,
Please evacuate.,Hinan shite kudasai.,中込佐知子と申します。,Introductions,Name (Formal),,8,
What time is it now?,Ima nan-ji desu ka?,一時,Hours,Telling Time,,8,
I'm on the phone right now.,Ima denwa chu desu.,二時,Hours,Telling Time,,8,
Breakfast starts at 6:30.,Roku-ji han kara asa-gohan desu.,三時,Hours,Telling Time,,8,
one o'clock,ichi-ji,四時,Hours,Telling Time,,8,
two o'clock,ni-ji,五時,Hours,Telling Time,,8,
three o'clock,san-ji,七時,Hours,Telling Time,,8,
four o'clock,yo-ji,八時,Hours,Telling Time,,8,
five o'clock,go-ji,九時,Hours,Telling Time,,8,
seven o'clock,shichi-ji,十一時,Hours,Telling Time,,8,
eight o'clock,hachi-ji,十二時,Hours,Telling Time,,8,
The kitchen will close at 12 o'clock.,Ju ni-ji ni kitchin ga shimarimasu.,これは好きです。,Likes,Preferences,,8,
This restaurant closes at 11pm. The kitchen closes at 10pm.,Kono resutoran wa ju ichi-ji ni shimarimasu. Kitchin wa ju-ji ni shimarimasu.,天ぷらは好きです。,Likes,Preferences,,8,
It will open at 11:00 AM.,Ju ichi-ji ni akimasu.,これは嫌いです。,Dislikes,Preferences,,8,
I like this.,Kore wa suki desu.,納豆は嫌いです。,Dislikes,Preferences,,8,
My favorite sushi is ikura (salmon roe).,Watashi wa ikura no sushi ga ichiban suki da.,好き嫌いはありますか？,Preferences,Asking,,8,
Are there any good ramen places?,Ii ramen-ya wa arimasu ka.,もっと小さい。,Comparisons,Size,,8,
Do you like or dislike anything in particular?,Suki kirai wa arimasu ka?,もっと大きい。,Comparisons,Size,,8,
Bigger.,Motto oki.,この鞄は私のです。,Lost & Found,Claiming an Item,,8,
I lost my passport.,Pasupoto o nakushimashita.,東京駅から新宿駅。,Travel,Routes,,8,
I lost my umbrella.,Kasa o nakushimashita.,電話番号は何番ですか。,Personal Information,Questions,,8,
Is this yours?,Kore wa anata no desu ka?,お名前は何ですか。,Personal Information,Questions,,8,
From Tokyo Station to Shinjuku Station.,Tokyo eki kara Shinjuku Eki.,何色？,Lost & Found,Description,,8,
What's your phone number? / What's the phone number?,Denwabango wa nan-ban desu ka.,大きい、茶色の鞄。,Lost & Found,Description,,8,
What's your name?,O-namae wa nan desuka.,小さい、黒の鞄。,Lost & Found,Description,,8,
Big brown bag.,"Oki, chairo no kaban.",疲れています。,Physical State,Feelings,,8,
Small black bag.,Chisai kuro no kaban.,寒いです。,Physical State,Feelings,,8,
I want to buy fish-shaped pancakes.,Taiyaki o kaitai desu.,私はコンビニに行きます。,Convenience Store,Shopping,,8,
Hello (on phone),moshi moshi,ごめん / ごめんね,Exclamations,Vocabulary,,8,
fish,tsuru,釣る / つる,Vocabulary,Essential Verbs,Verb Class 1 (Godan),9,Animals
Do you understand?,Wakarimasu ka?,わかりますか？,Comprehension,Questions,Transportation,9,At a Restaurant
I understand.,Wakarimashita.,わかりました。,Comprehension,Common Responses,Ordering,9,General
I’m sorry.,Gomennasai.,ごめんなさい。,Apology,Polite Expressions,Other,9,Questions
Thank you very much. (very formal),Domo arigato gozaimasu.,どうもありがとうございます。,Expressing Thanks (Formal),Gratitude,Food,9,Providing Information
May I help you?,Irasshaimase.,いらっしゃいませ。,Greeting Customers,Shopping & Restaurants,,9,
Please give me the map.,Chizu o kudasai.,地図をください。,Requests,Items,,9,
Goodbye.,Sayonara.,さようなら。,General,Farewells,,9,
I don't understand Japanese.,Nihongo wa wakarimasen.,日本語は分かりません。,Lack of Understanding,Communication Help,,9,
Can you say it again?,Mo ichido itte kudasai?,もう一度言ってください？,Repetition,Communication Help,,9,
English okay?,Eigo okkē,英語オッケー？,Communication Help,Language Ability,,9,
Please speak slowly.,Yukkuri hanashite kudasai.,ゆっくり話してください。,Pace,Communication Help,,9,
What? Could you say that again?,E? Mo ichi-do onegai shimasu.,え？もう一度お願いします。,Repetition,Communication Help,,9,
Once again.,Mo Ichido.,もう一度。,Repetition,Communication Help,,9,
Slowly.,Yukkuri.,ゆっくり。,Pace,Communication Help,,9,
"Again, say, please.",Mo ichido itte kudasai.,もう一度言ってください。,Repetition,Communication Help,,9,
Two adults and one child.,"Otona ni-mei, kodomo ichi-mei.",大人二名、子供一名。,Greeting & Seating,At a Restaurant,,9,
Non-smoking.,Kin'en.,禁煙。,Stating Preferences,At a Restaurant,,9,
Smoking.,Kitsuen.,喫煙。,Stating Preferences,At a Restaurant,,9,
"Two people, non-smoking.",Ni-mei kin'en.,二名、禁煙。,Greeting & Seating,At a Restaurant,,9,
What do you recommend?,Nani ga o-susume desu ka.,何がおすすめですか。,Ordering,At a Restaurant,,9,
"Tempura, please.",Tempura kudasai.,天ぷらください。,Ordering,At a Restaurant,,9,
Beer.,Biru.,ビール。,Ordering,At a Restaurant,,9,
Coffee.,Kohi.,コーヒー。,Ordering,At a Restaurant,,9,
English tea.,Kocha.,紅茶。,Ordering,At a Restaurant,,9,
"Separate checks, please.",Betsubetsu de o-negai shimasu.,別々でお願いします。,Paying the Bill,At a Restaurant,,9,
Do you have five people in your party?,Go-mei-sama desu ka.,五名様ですか？,Counting,People,,9,
"Three cups of coffee, please.",Kohi wo san bai kudasai.,コーヒーを三杯ください。,Counting,Food & Drink,,9,
One cup.,Ippai.,一杯。,Counting,Food & Drink,,9,
Two cups.,Nihai.,二杯。,Counting,Food & Drink,,9,
Please give me two glasses of sake.,Sake ni hai kudasai.,酒二杯ください。,Counting,Food & Drink,,9,
One piece.,Ikko.,一個。,Objects,Counting,,9,
Two pieces.,Niko.,二個。,Objects,Counting,,9,
"Can I have a one thousand yen Suica card, please.",Sen-en no suika wo kudasai.,千円のスイカをください。,Transportation Cards,Money,,9,
It's 68 yen.,Roku-ju-hachi-en desu.,六十八円です。,Stating Price,Money,,9,
One thousand yen.,Sen-en.,千円。,Currency,Money,,9,
Two thousand yen.,Ni-sen-en.,二千円。,Currency,Money,,9,
Five thousand yen.,Go-sen-en.,五千円。,Currency,Money,,9,
Ten thousand yen.,Ichi-man-en.,一万円。,Currency,Money,,9,
Twenty thousand yen.,Ni-man-en.,二万円。,Currency,Money,,9,
Please tell me.,Oshiete kudasai.,教えてください。,Requests,Information,,9,
The next station is Osaka.,Tsugi no eki wa Osaka desu.,次の駅は大阪です。,Transportation,Train,,9,
Please tell me how to get to Narita airport.,Narita kuko no ikikata o oshiete kudasai.,成田空港の行き方を教えてください。,Transportation,Airport,,9,
I would like a map.,Chizu onegai shimasu.,地図お願いします。,Requests,Items,,9,
Please get me a taxi.,Takushi o onegai shimasu.,タクシーをお願いします。,Transportation,Taxi,,9,
Go straight.,Massugu susumu.,まっすぐ進む。,Instructions,Directions,,9,
Turn right.,Migi ni magaru.,右に曲がる。,Instructions,Directions,,9,
Turn left.,Hidari ni magaru.,左に曲がる。,Instructions,Directions,,9,
Go straight,massugu itte kudasai,コンビニで右に曲がる。,Using Landmarks,Directions,,9,
Turn left,hidari ni magatte kudasai,銀行で左に曲がる。,Using Landmarks,Directions,,9,
Turn right,migi ni magatte kudasai,左に曲がってください。,Instructions,Directions,,9,
Then go straight.,"Soshite, massugu ikimasu.",右に曲がってください。,Instructions,Directions,,9,
Please go straight.,Massugu susunde kudasai.,右にコンビニがあります。,Locations,Directions,,9,
Please take our picture.,Shashin o totte kudasai.,これは日本語でどう言いますか？,Translation,Language Help,,9,
Please give me your email address.,Meru adoresu o oshiete kudasai.,[ ]は日本語でどう言いますか？,Translation,Language Help,,9,
How do you say [ ] in Japanese?,[ ] wa nihongo de do iimasu ka?,これは日本語でどう言いますか。,Translation,Language Help,,9,
How do you read this?,Kore wa do yomimasu ka?,これはどういう意味ですか。,Language Help,Meaning,,9,
What is that?,Sore wa nan desu ka.,ドライヤーはありますか？,At the Hotel,Amenities,,9,
Do you have a hair dryer?,Doraiya wa arimasu ka.,電力変換器はありますか？,At the Hotel,Amenities,,9,
I'll send a postcard to my friend.,Hagaki wo tomodachi ni okurimasu.,この本はいくらですか。,Asking Price,Shopping,,9,
How much is this book?,Kono hon wa ikura desu ka.,五千円です。,Stating Price,Money,,9,
Where?,Doko?,大人二名。,Counting,People,,9,
Please dial 110. (Please call the police.),Hyaku to ban onegai shimasu.,110番する。,Actions,Emergency,,9,
My name is...,Watashi no namae wa...,医者を呼んでください。,Medical Assistance,Health,,9,
The address is...,Jusho wa...,薬局はどこですか？,Locations,Health,,9,
Fire!,Kaji!,お腹が痛いです。,Health,Pain / Ailments,,9,
Please call a doctor.,Isha o yonde kudasai.,頭が痛いです。,Health,Pain / Ailments,,9,
I have hay fever.,Kahunsho desu.,大盛り。,Dietary Needs,Vocabulary,,9,
That's medicine.,Are wa kusuri desu.,少なめ。,Dietary Needs,Vocabulary,,9,
Children are not allowed.,Kodomo wa dame desu.,ライス大盛り。,Requests,Dietary Needs,,9,
Large serving.,Omori.,ライス少なめ。,Requests,Dietary Needs,,9,
No! (Don't eat this),Dame.,避難してください。,Emergency,Evacuation,,9,
nine o'clock,ku-ji,十二時に閉まります。,Closing,Business Hours,,9,
eleven o'clock,juichi-ji,十二時にキッチンが閉まります。,Closing,Business Hours,,9,
twelve o'clock,juni-ji,このレストランは十一時に閉まります。キッチンは十時に閉まります。,Closing,Business Hours,,9,
It will close at 12 o'clock.,Ju ni-ji ni shimarimasu.,十一時時に開きます。,Opening,Business Hours,,9,
I like seaweed.,Wakame ga suki desu.,いいラーメン屋はありますか。,Asking for Recommendations,At a Restaurant,,9,
Beautiful!,Utsukushi!,鞄をなくしました。,Lost & Found,Reporting a Loss,,9,
Smaller.,Motto chisai.,忘れ物取扱所はどこですか？,Lost & Found,Finding the Office,,9,
I lost a bag.,Kaban o nakushimashita.,いけない！お財布を忘れた！,Lost & Found,Reporting a Loss,,9,
Oh no! I forgot my wallet!,Ikenai! O-saifu o wasureta!,傘をなくしました。,Lost & Found,Reporting a Loss,,9,
I'm tired.,Tsukarete imasu.,お腹が空いています。,Physical State,Feelings,,9,
I'm cold.,Samui desu.,喉が渇いています。,Physical State,Feelings,,9,
My throat is dry. (I'm thirsty),Nodo ga kawaite imasu.,XXXをください。,Requests,General,,9,
It's free.,Sabisu.,電車の切符を買います。,Transportation,Train,,9,
Woman,onna,牛丼,Food,Vocabulary,,9,
Younger brother,ototo,そば,Food,Vocabulary,,9,
Younger sister,imoto,卵,Food,Vocabulary,,9,
Beef bowl,gyudon,焼き鳥,Food,Vocabulary,,9,
Buckwheat noodles,soba,アイスコーヒー,Food,Vocabulary,,9,
Eggs,tamago,カレーライス,Food,Vocabulary,,9,
Grilled chicken skewers,yakitori,ハンバーグ,Food,Vocabulary,,9,
Japanese curry,karē raisu,肉,Food,Vocabulary,,9,
Japanese yams,tororo imo,ラーメン,Food,Vocabulary,,9,
Meat,niku,おにぎり,Food,Vocabulary,,9,
Pickled plum,umeboshi,醤油,Food,Vocabulary,,9,
Ramen noodles,ramen,寿司,Food,Vocabulary,,9,
Rice ball,onigiri,緑茶,Food,Vocabulary,,9,
Soy sauce,shoyu,紅茶,Food,Vocabulary,,9,
Sushi,sushi,天ぷら,Food,Vocabulary,,9,
Tea (black),kocha,飛行機,Places & Things,Vocabulary,,9,
Water,mizu,銀行,Places & Things,Vocabulary,,9,
Ambulance,kyukyusha,バス,Places & Things,Vocabulary,,9,
Convenience store,konbini,忘れ物取扱所,Places & Things,Vocabulary,,9,
Dead end,tsukiatari,地図,Places & Things,Vocabulary,,9,
Map,chizu,薬局,Places & Things,Vocabulary,,9,
Menu,menyu,郵便局,Places & Things,Vocabulary,,9,
Pharmacy,yakkyoku,地下鉄,Places & Things,Vocabulary,,9,
Television,terebi,新幹線,Places & Things,Vocabulary,,9,
Ticket,kippu,財布,Places & Things,Vocabulary,,9,
Train (electric),densha,ワイファイ,Places & Things,Vocabulary,,9,
Train (bullet),shinkansen,アレルギー,Concepts,Vocabulary,,9,
Birthday,tanjobi,頭痛,Concepts,Vocabulary,,9,
Day,hi,左,Concepts,Vocabulary,,9,
Headache,zutsu,忘れ物,Concepts,Vocabulary,,9,
Left,hidari,薬,Concepts,Vocabulary,,9,
Marriage,kekkon,注文,Concepts,Vocabulary,,9,
Model (of a device),kishu,右,Concepts,Vocabulary,,9,
to call,yobu / yobimasu,食べる / 食べます,Verbs,Vocabulary,,9,
to eat,taberu / tabemasu,曲がる / 曲がります,Verbs,Vocabulary,,9,
to hide,kakureru,分かる / 分かります,Verbs,Vocabulary,,9,
Cute,kawaii,ここ,Other,Vocabulary,,9,
Healthy / Energetic,genki,まっすぐ,Other,Vocabulary,,9,
Straight,massugu,何,Other,Vocabulary,,9,
That,sore,どの / どちら,Other,Vocabulary,,9,
This,kore,抜き,Other,Vocabulary,,9,
I don’t understand.,Wakarimasen.,わかりません。,Comprehension,Common Responses,At a Restaurant,10,Language Help
Do you speak English?,Eigo o hanashimasu ka?,英語を話しますか？,Language,Questions,Temperature,10,People
Hello.,Konnichiwa.,こんにちは。,General,Greetings,Apologies,10,People
Excuse me.,Sumimasen.,すみません。,Polite Expressions,Getting Attention / Apology,Comprehension,10,People
Please.,O-negai shimasu.,お願いします。,Requests,Polite Expressions,Counting,10,Vocabulary
Yes.,Hai.,はい。,Common Responses,Basic Answers,Counting,10,Vocabulary
No.,Iie.,いいえ。,Common Responses,Basic Answers,Counting,10,Vocabulary
Thank you.,Arigato.,ありがとう。,Gratitude,Expressing Thanks,Food & Drink,10,Buying Tickets
Thank you very much!,Arigato gozaimasu.,ありがとうございます！,Expressing Thanks (Formal),Gratitude,Concepts,10,
Please give me this.,Kore kudasai.,これください。,Requests,General,,10,
Please give me that.,Sore kudasai.,それください。,Requests,General,,10,
Two tickets please.,Ni mai kippu wo kudasai.,二枚切符をください。,Shopping & Restaurants,Buying Tickets,,10,
"Can I have some water, please?",Mizu o kudasai.,水をください。,Requests,Food & Drink,,10,
"Check, please.",O-kaikei o-negai shimasu.,お会計をお願いします。,Paying the Bill,Shopping & Restaurants,,10,
Good morning.,O-hayo gozaimasu.,おはようございます。,Time of Day,Greetings,,10,
Good evening.,Konban wa.,こんばんは。,Time of Day,Greetings,,10,
Where is the bathroom?,Toire wa doko desu ka?,トイレはどこですか？,Locations,Asking for Directions,,10,
Excuse me. I don't understand.,Sumimasen. Wakarimasen.,すみません。分かりません。,Lack of Understanding,Communication Help,,10,
Where is Shibuya station?,Shibuya eki wa doko desu ka?,渋谷駅はどこですか？,Locations,Asking for Directions,,10,
Can you speak English?,Eigo o hanasemasu ka?,英語を話せますか？,Communication Help,Language Ability,,10,
How many people in your party?,Nan-mei sama desu ka?,何名様ですか？,Greeting & Seating,At a Restaurant,,10,
Two people.,Ni mei.,二名。,Greeting & Seating,At a Restaurant,,10,
How many people are in your party?,Nan-mei-sama desu ka.,何名様ですか。,Counting,People,,10,
"Four tickets, please.",Kippu o yon-mai kudasai.,切符を四枚ください。,Objects,Counting,,10,
"Two of these, please.",Kore o ni-ko kudasai.,これを二個ください。,Objects,Counting,,10,
One ticket.,Ichi mai.,一枚。,Objects,Counting,,10,
How much?,Ikura desu ka?,いくらですか？,Asking Prices,Shopping & Money,,10,
How much is this?,Kore wa ikura desu ka?,これはいくらですか？,Asking Prices,Shopping & Money,,10,
How much is that?,Sore wa ikura desu ka?,それはいくらですか？,Asking Prices,Shopping & Money,,10,
"One ticket to Narita Airport, please.",Narita kuko made no kippu o ichi-mai kudasai.,成田空港までの切符を一枚ください。,Transportation,Buying Tickets,,10,
Where is the bus stop?,Basu tei wa doko desu ka?,バス停はどこですか？,Transportation,Bus,,10,
"Two tickets to Narita Airport, please.",Narita kuko made no kippu o ni mai kudasai.,成田空港までの切符を二枚ください。,Transportation,Buying Tickets,,10,
Where is the ticket gate?,Kaisatsu wa doko desu ka.,改札はどこですか。,Transportation,Train,,10,
"A ticket to Tokyo Station, please.",Tokyo eki made no kippu o kudasai.,東京駅までの切符をください。,Transportation,Buying Tickets,,10,
One ticket to Tokyo Station please.,Tokyo eki made no kippu wo ichi-mai kudasai.,東京駅までの切符を一枚ください。,Transportation,Buying Tickets,,10,
"Tickets to Osaka Station, please.",Osaka eki made no kippu o kudasai.,大阪駅までの切符をください。,Transportation,Buying Tickets,,10,
Will this train go to Tokyo Station?,Tokyo eki made ikimasu ka?,東京駅まで行きますか？,Transportation,Train,,10,
Does this bus go to Narita?,Kono basu wa Narita ni ikimasu ka.,このバスは成田に行きますか。,Transportation,Bus,,10,
I would like to go to Tokyo Station.,Tokyo eki e onegai shimasu.,東京駅へお願いします。,Transportation,Taxi,,10,
Where is the taxi terminal?,Takushinoriba wa doko ni arimasu ka.,タクシー乗り場はどこにありますか。,Transportation,Taxi,,10,
Excuse me. Where's the taxi stand?,Sumimasen. Takushi noriba wa....,すみません。タクシー乗り場は...。,Transportation,Taxi,,10,
Is there a convenience store around here?,Konbini wa chikaku ni arimasu ka?,コンビニは近くにありますか？,Locations,Asking for Directions,,10,
This is my email address.,Watashi no meru adoresu desu.,これは何ですか。,Identification,Questions,,10,
Please write it down.,Kaite kudasai.,英語がわかりますか。,Comprehension,Language Help,,10,
Do you understand English?,Eigo ga wakarimasu ka.,それは何ですか。,Identification,Questions,,10,
What does that mean?,Sore wa doiu imi desu ka?,意味が分かりません。,Comprehension,Language Help,,10,
I'll take a bath at the hotel.,Hoteru de nyuyoku suru.,どこ？,Location,Questions,,10,
Two adults.,Otona ni mei.,一名。,Counting,People,,10,
This ticket can be used nationwide.,Kono kippu wa zenkokukyotsu desu.,三名。,Counting,People,,10,
One person.,Ichi mei.,英語のガイドはありますか？,Information,Asking for Assistance,,10,
Three people.,San mei.,英語のメニューはありますか？,Information,At a Restaurant,,10,
Two adults for Spiderman.,Supaidaman otona ni mei.,英語のメニューをください。,Information,At a Restaurant,,10,
I don't eat meat. I eat fish.,Niku wa tabemasen. Sakana wa tabemasu.,助けてください。,Emergency,Calling for Help,,10,
I like fish.,Sakana wa suki desu.,警察を呼んでください。,Emergency,Calling for Help,,10,
I don't eat (anything).,Tabemasen.,110番お願いします。,Emergency,Calling for Help,,10,
Please help me.,Tasukete kudasai.,誰か、助けて！,Emergency,Calling for Help,,10,
Please call the police.,Keisatsu o yonde kudasai.,救急車を呼んでください！,Emergency,Calling for Help,,10,
Please call an ambulance!,Kyukyusha wo yonde kudasai!,火事です。119番をお願いします。,Emergency,Fire,,10,
Call the police.,Hyaku to ban suru.,火事！,Emergency,Fire,,10,
This bag is mine.,Kono kaban wa watashi no desu.,パスポートをなくしました。,Lost & Found,Reporting a Loss,,10,
Tea (green),ryokucha,水,Food,Vocabulary,,10,
Tempura,tempura,救急車,Places & Things,Vocabulary,,10,
Airplane,hikōki,トイレ / お手洗い,Places & Things,Vocabulary,,10,
Bank,ginko,バス停,Places & Things,Vocabulary,,10,
Bathroom / Toilet,toire / otearai,コンビニ,Places & Things,Vocabulary,,10,
House entrance,genkan,メニュー,Places & Things,Vocabulary,,10,
Lost and found,wasuremono toriatsukaijo,パスポート,Places & Things,Vocabulary,,10,
Passport,pasupoto,駅,Places & Things,Vocabulary,,10,
Post office,yubinkyoku,タクシー,Places & Things,Vocabulary,,10,
Taxi,takushii,切符,Places & Things,Vocabulary,,10,
Telephone card,tereka,電車,Places & Things,Vocabulary,,10,
Order,chumon,円,Concepts,Vocabulary,,10,
Here,koko,それ,Other,Vocabulary,,10,
Or,aruiwa,これ,Other,Vocabulary,,10,
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
    return cardA.english.localeCompare(cardB.english);
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
  englishVoiceSelect: document.querySelector('#englishVoiceSelect'),
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
  dom.cardFront.textContent = card.english;
  dom.cardBackRomaji.textContent = card.romaji;
  dom.cardBackJapanese.textContent = card.japanese;
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
    dom.englishVoiceSelect.disabled = true;
    dom.speakButtons.forEach((btn) => btn.setAttribute('disabled', 'disabled'));
    return;
  }
  const stored = loadJSON(STORAGE_KEYS.voices) ?? {};
  const updateVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    const jaVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('ja'));
    const enVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));

    dom.voiceSelect.innerHTML = '';
    dom.englishVoiceSelect.innerHTML = '';

    const createOption = (voice) => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      return option;
    };

    const populate = (select, list, preferred) => {
      if (!list.length) {
        const option = document.createElement('option');
        option.textContent = 'No voices detected';
        option.value = '';
        option.disabled = true;
        option.selected = true;
        select.appendChild(option);
        return;
      }
      list.forEach((voice) => {
        const option = createOption(voice);
        if (voice.name === preferred) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    };

    populate(dom.voiceSelect, jaVoices, stored.jaVoice);
    populate(dom.englishVoiceSelect, enVoices, stored.enVoice);
  };

  updateVoices();
  window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

  const handleSelection = () => {
    const selection = {
      jaVoice: dom.voiceSelect.value || null,
      enVoice: dom.englishVoiceSelect.value || null
    };
    saveJSON(STORAGE_KEYS.voices, selection);
  };

  dom.voiceSelect.addEventListener('change', handleSelection);
  dom.englishVoiceSelect.addEventListener('change', handleSelection);
}

function speakText(text, { lang, preferredName }) {
  if (!('speechSynthesis' in window) || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
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
      const cardId = dom.cardDisplay.dataset.cardId;
      if (!cardId) return;
      const card = cardMap.get(cardId);
      const stored = loadJSON(STORAGE_KEYS.voices) ?? {};
      if (button.dataset.target === 'english') {
        speakText(card.english, { lang: 'en-US', preferredName: stored.enVoice });
      } else {
        const speechText = card.japanese || card.romaji;
        speakText(speechText, { lang: 'ja-JP', preferredName: stored.jaVoice });
      }
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
