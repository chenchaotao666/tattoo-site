import { StyleSuggestion } from '../services/generateService';

// 预设的50种常用图片生成建议
export const STYLE_SUGGESTIONS = {
  zh: [
    // 动物类
    { id: 'cute-cat', name: '可爱小猫', content: '一只可爱的小猫咪，有着大大的眼睛和蓬松的毛发', category: 'animals' },
    { id: 'friendly-dog', name: '友好小狗', content: '一只友善的小狗，摇着尾巴，表情开心', category: 'animals' },
    { id: 'colorful-butterfly', name: '彩色蝴蝶', content: '一只美丽的彩色蝴蝶，翅膀上有精美的花纹', category: 'animals' },
    { id: 'wise-owl', name: '智慧猫头鹰', content: '一只聪明的猫头鹰，戴着小眼镜，坐在树枝上', category: 'animals' },
    { id: 'happy-elephant', name: '快乐大象', content: '一只快乐的大象，长长的鼻子，温和的眼神', category: 'animals' },
    { id: 'graceful-swan', name: '优雅天鹅', content: '一只优雅的白天鹅，在清澈的湖水中游泳', category: 'animals' },
    { id: 'playful-dolphin', name: '顽皮海豚', content: '一只顽皮的海豚，正在海水中跳跃嬉戏', category: 'animals' },
    { id: 'majestic-lion', name: '威严狮子', content: '一只威严的狮子，有着浓密的鬃毛和王者气息', category: 'animals' },
    { id: 'cute-panda', name: '可爱熊猫', content: '一只可爱的大熊猫，黑白分明，正在吃竹子', category: 'animals' },
    { id: 'colorful-parrot', name: '彩色鹦鹉', content: '一只色彩斑斓的鹦鹉，有着明亮的羽毛', category: 'animals' },
    // 自然风景类
    { id: 'beautiful-flower', name: '美丽花朵', content: '一朵美丽的花，花瓣层层叠叠，色彩鲜艳', category: 'nature' },
    { id: 'tall-tree', name: '高大树木', content: '一棵高大的树木，枝叶茂盛，根系发达', category: 'nature' },
    { id: 'peaceful-mountain', name: '宁静山峰', content: '宁静的山峰，云雾缭绕，景色壮观', category: 'nature' },
    { id: 'flowing-river', name: '流淌小河', content: '一条清澈的小河，水流潺潺，两岸绿树成荫', category: 'nature' },
    { id: 'bright-sun', name: '明亮太阳', content: '明亮的太阳，散发着温暖的光芒', category: 'nature' },
    { id: 'crescent-moon', name: '弯弯月亮', content: '弯弯的月亮，在夜空中闪闪发光', category: 'nature' },
    { id: 'twinkling-stars', name: '闪烁星星', content: '满天的星星，在夜空中闪闪发光', category: 'nature' },
    { id: 'fluffy-clouds', name: '蓬松云朵', content: '蓬松的白云，在蓝天中飘荡', category: 'nature' },
    { id: 'colorful-rainbow', name: '彩色彩虹', content: '美丽的彩虹，横跨天空，色彩斑斓', category: 'nature' },
    { id: 'ocean-waves', name: '海洋波浪', content: '汹涌的海浪，拍打着海岸，溅起雪白的浪花', category: 'nature' },
    // 卡通人物类
    { id: 'happy-princess', name: '快乐公主', content: '一位快乐的公主，穿着华丽的裙子，戴着王冠', category: 'characters' },
    { id: 'brave-knight', name: '勇敢骑士', content: '一位勇敢的骑士，穿着闪亮的盔甲，手持长剑', category: 'characters' },
    { id: 'magical-fairy', name: '魔法仙女', content: '一位魔法仙女，有着透明的翅膀和魔法棒', category: 'characters' },
    { id: 'funny-clown', name: '有趣小丑', content: '一个有趣的小丑，红鼻子，彩色的衣服，表情搞笑', category: 'characters' },
    { id: 'superhero', name: '超级英雄', content: '一位超级英雄，穿着酷炫的服装，准备拯救世界', category: 'characters' },
    { id: 'cute-robot', name: '可爱机器人', content: '一个可爱的机器人，有着圆圆的身体和友善的表情', category: 'characters' },
    { id: 'friendly-alien', name: '友好外星人', content: '一个友好的外星人，有着大眼睛和绿色的皮肤', category: 'characters' },
    { id: 'wise-wizard', name: '智慧巫师', content: '一位智慧的巫师，长胡子，穿着星星图案的长袍', category: 'characters' },
    { id: 'dancing-ballerina', name: '舞蹈芭蕾', content: '一位优雅的芭蕾舞者，穿着蓬蓬裙，正在跳舞', category: 'characters' },
    { id: 'smiling-chef', name: '微笑厨师', content: '一位微笑的厨师，戴着高高的厨师帽，围着围裙', category: 'characters' },
    // 交通工具类
    { id: 'fast-car', name: '快速汽车', content: '一辆快速的汽车，流线型车身，准备出发', category: 'vehicles' },
    { id: 'big-truck', name: '大卡车', content: '一辆大卡车，车厢宽敞，轮子很大', category: 'vehicles' },
    { id: 'flying-airplane', name: '飞行飞机', content: '一架飞行的飞机，在蓝天白云中翱翔', category: 'vehicles' },
    { id: 'sailing-boat', name: '航行帆船', content: '一艘航行的帆船，白色的帆布鼓满了风', category: 'vehicles' },
    { id: 'speedy-train', name: '快速火车', content: '一列快速的火车，在铁轨上疾驰而过', category: 'vehicles' },
    { id: 'colorful-bicycle', name: '彩色自行车', content: '一辆彩色的自行车，有着明亮的颜色和铃铛', category: 'vehicles' },
    { id: 'fire-truck', name: '消防车', content: '一辆红色的消防车，装满了救火设备', category: 'vehicles' },
    { id: 'school-bus', name: '校车', content: '一辆黄色的校车，载着孩子们去上学', category: 'vehicles' },
    { id: 'police-car', name: '警车', content: '一辆警车，有着闪烁的警灯和警报器', category: 'vehicles' },
    { id: 'ambulance', name: '救护车', content: '一辆救护车，白色车身，红十字标记', category: 'vehicles' },
    // 食物类
    { id: 'delicious-cake', name: '美味蛋糕', content: '一个美味的蛋糕，多层设计，上面有奶油和装饰', category: 'food' },
    { id: 'fresh-fruit', name: '新鲜水果', content: '新鲜的水果，苹果、香蕉、橙子等，色彩丰富', category: 'food' },
    { id: 'tasty-pizza', name: '美味披萨', content: '一个美味的披萨，上面有丰富的配菜和芝士', category: 'food' },
    { id: 'sweet-ice-cream', name: '甜美冰淇淋', content: '甜美的冰淇淋，多种口味，装在蛋筒里', category: 'food' },
    { id: 'colorful-candy', name: '彩色糖果', content: '彩色的糖果，各种形状和颜色，看起来很甜', category: 'food' },
    { id: 'healthy-vegetables', name: '健康蔬菜', content: '健康的蔬菜，胡萝卜、花椰菜、青菜等', category: 'food' },
    { id: 'warm-bread', name: '温暖面包', content: '温暖的面包，刚出炉，散发着香气', category: 'food' },
    { id: 'refreshing-drink', name: '清爽饮料', content: '清爽的饮料，装在杯子里，有吸管', category: 'food' },
    { id: 'chocolate-cookies', name: '巧克力饼干', content: '美味的巧克力饼干，酥脆可口', category: 'food' },
    { id: 'birthday-cupcake', name: '生日纸杯蛋糕', content: '生日纸杯蛋糕，上面有蜡烛和彩色装饰', category: 'food' }
  ],
  en: [
    // Animals
    { id: 'cute-cat', name: 'Cute Cat', content: 'A cute little kitten with big eyes and fluffy fur', category: 'animals' },
    { id: 'friendly-dog', name: 'Friendly Dog', content: 'A friendly little dog wagging its tail with a happy expression', category: 'animals' },
    { id: 'colorful-butterfly', name: 'Colorful Butterfly', content: 'A beautiful colorful butterfly with intricate patterns on its wings', category: 'animals' },
    { id: 'wise-owl', name: 'Wise Owl', content: 'A smart owl wearing little glasses, sitting on a tree branch', category: 'animals' },
    { id: 'happy-elephant', name: 'Happy Elephant', content: 'A happy elephant with a long trunk and gentle eyes', category: 'animals' },
    { id: 'graceful-swan', name: 'Graceful Swan', content: 'An elegant white swan swimming in clear lake water', category: 'animals' },
    { id: 'playful-dolphin', name: 'Playful Dolphin', content: 'A playful dolphin jumping and playing in the ocean water', category: 'animals' },
    { id: 'majestic-lion', name: 'Majestic Lion', content: 'A majestic lion with a thick mane and royal presence', category: 'animals' },
    { id: 'cute-panda', name: 'Cute Panda', content: 'A cute giant panda with distinct black and white markings, eating bamboo', category: 'animals' },
    { id: 'colorful-parrot', name: 'Colorful Parrot', content: 'A colorful parrot with bright and vibrant feathers', category: 'animals' },
    // Nature
    { id: 'beautiful-flower', name: 'Beautiful Flower', content: 'A beautiful flower with layered petals in bright colors', category: 'nature' },
    { id: 'tall-tree', name: 'Tall Tree', content: 'A tall tree with lush foliage and strong roots', category: 'nature' },
    { id: 'peaceful-mountain', name: 'Peaceful Mountain', content: 'Peaceful mountain peaks surrounded by mist with spectacular scenery', category: 'nature' },
    { id: 'flowing-river', name: 'Flowing River', content: 'A clear flowing river with gentle currents and green trees on both sides', category: 'nature' },
    { id: 'bright-sun', name: 'Bright Sun', content: 'A bright sun radiating warm light', category: 'nature' },
    { id: 'crescent-moon', name: 'Crescent Moon', content: 'A crescent moon shining brightly in the night sky', category: 'nature' },
    { id: 'twinkling-stars', name: 'Twinkling Stars', content: 'Countless stars twinkling in the night sky', category: 'nature' },
    { id: 'fluffy-clouds', name: 'Fluffy Clouds', content: 'Fluffy white clouds floating in the blue sky', category: 'nature' },
    { id: 'colorful-rainbow', name: 'Colorful Rainbow', content: 'A beautiful rainbow stretching across the sky with vibrant colors', category: 'nature' },
    { id: 'ocean-waves', name: 'Ocean Waves', content: 'Powerful ocean waves crashing against the shore with white foam', category: 'nature' },
    // Characters
    { id: 'happy-princess', name: 'Happy Princess', content: 'A happy princess wearing a gorgeous dress and a crown', category: 'characters' },
    { id: 'brave-knight', name: 'Brave Knight', content: 'A brave knight in shining armor holding a sword', category: 'characters' },
    { id: 'magical-fairy', name: 'Magical Fairy', content: 'A magical fairy with transparent wings and a magic wand', category: 'characters' },
    { id: 'funny-clown', name: 'Funny Clown', content: 'A funny clown with a red nose and colorful clothes with a comical expression', category: 'characters' },
    { id: 'superhero', name: 'Superhero', content: 'A superhero in a cool costume ready to save the world', category: 'characters' },
    { id: 'cute-robot', name: 'Cute Robot', content: 'A cute robot with a round body and friendly expression', category: 'characters' },
    { id: 'friendly-alien', name: 'Friendly Alien', content: 'A friendly alien with big eyes and green skin', category: 'characters' },
    { id: 'wise-wizard', name: 'Wise Wizard', content: 'A wise wizard with a long beard wearing a star-patterned robe', category: 'characters' },
    { id: 'dancing-ballerina', name: 'Dancing Ballerina', content: 'An elegant ballerina in a tutu dress performing a dance', category: 'characters' },
    { id: 'smiling-chef', name: 'Smiling Chef', content: 'A smiling chef wearing a tall chef hat and apron', category: 'characters' },
    // Vehicles
    { id: 'fast-car', name: 'Fast Car', content: 'A fast car with streamlined body ready to go', category: 'vehicles' },
    { id: 'big-truck', name: 'Big Truck', content: 'A big truck with a spacious cargo area and large wheels', category: 'vehicles' },
    { id: 'flying-airplane', name: 'Flying Airplane', content: 'A flying airplane soaring through blue skies and white clouds', category: 'vehicles' },
    { id: 'sailing-boat', name: 'Sailing Boat', content: 'A sailing boat with white sails full of wind', category: 'vehicles' },
    { id: 'speedy-train', name: 'Speedy Train', content: 'A fast train speeding along the railway tracks', category: 'vehicles' },
    { id: 'colorful-bicycle', name: 'Colorful Bicycle', content: 'A colorful bicycle with bright colors and a bell', category: 'vehicles' },
    { id: 'fire-truck', name: 'Fire Truck', content: 'A red fire truck equipped with firefighting equipment', category: 'vehicles' },
    { id: 'school-bus', name: 'School Bus', content: 'A yellow school bus carrying children to school', category: 'vehicles' },
    { id: 'police-car', name: 'Police Car', content: 'A police car with flashing lights and sirens', category: 'vehicles' },
    { id: 'ambulance', name: 'Ambulance', content: 'An ambulance with white body and red cross markings', category: 'vehicles' },
    // Food
    { id: 'delicious-cake', name: 'Delicious Cake', content: 'A delicious multi-layer cake with cream and decorations', category: 'food' },
    { id: 'fresh-fruit', name: 'Fresh Fruit', content: 'Fresh fruits like apples, bananas, oranges with rich colors', category: 'food' },
    { id: 'tasty-pizza', name: 'Tasty Pizza', content: 'A delicious pizza with rich toppings and cheese', category: 'food' },
    { id: 'sweet-ice-cream', name: 'Sweet Ice Cream', content: 'Sweet ice cream with multiple flavors served in a cone', category: 'food' },
    { id: 'colorful-candy', name: 'Colorful Candy', content: 'Colorful candies in various shapes and colors that look sweet', category: 'food' },
    { id: 'healthy-vegetables', name: 'Healthy Vegetables', content: 'Healthy vegetables like carrots, broccoli, and greens', category: 'food' },
    { id: 'warm-bread', name: 'Warm Bread', content: 'Warm bread fresh from the oven with a delicious aroma', category: 'food' },
    { id: 'refreshing-drink', name: 'Refreshing Drink', content: 'A refreshing drink served in a cup with a straw', category: 'food' },
    { id: 'chocolate-cookies', name: 'Chocolate Cookies', content: 'Delicious chocolate cookies that are crispy and tasty', category: 'food' },
    { id: 'birthday-cupcake', name: 'Birthday Cupcake', content: 'Birthday cupcakes with candles and colorful decorations', category: 'food' }
  ]
};

// 从数组中随机选择指定数量的元素
export const getRandomSuggestions = (suggestions: { zh: StyleSuggestion[], en: StyleSuggestion[], ja?: StyleSuggestion[] }, count: number = 6, language: 'zh' | 'en' | 'ja' = 'zh'): StyleSuggestion[] => {
  const languageSuggestions = suggestions[language] || suggestions['en'] || [];
  const shuffled = [...languageSuggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};