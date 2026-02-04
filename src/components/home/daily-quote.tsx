"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Sparkles } from "lucide-react";

const quotes = [
  // --- 加缪 (Albert Camus) ---
  "在隆冬，我终于发现，我身上有一个不可战胜的夏天。",
  "攀登顶峰的奋斗本身足以充实一个人的心灵。人们必须想象西西弗斯是幸福的。",
  "对未来真正的慷慨，是把一切献给现在。",
  "重要的不是治愈，而是带着病痛活下去。",
  "一切伟大的行动和思想，都有一个微不足道的开始。",
  "我并不期待人生可以过得很顺利，但我希望碰到人生难关的时候，自己可以是它的对手。",
  "不要走在我前面，我可能不会跟随；不要走在我后面，我可能不会带路；走在我旁边，做我的朋友。",
  "生活是无法治愈的疾病。",
  "人必须活在当下，因为只有当下是真实的。",
  "我们要么使自己痛苦，要么使自己强大，工作量是一样的。",
  "我反抗，故我们在。",
  "诞生在这个世界上，本身就是一场奇迹。",
  "真正的救赎，并不是厮杀后的胜利，而是能在苦难之中找到生的力量。",
  "或许我们无法改变世界，但我们至少可以拒绝被这个世界改变。",
  "爱，就是燃烧，就是耗尽自己。",
  "不被爱只是不走运，而不会爱是种不幸。",
  "秋天是第二个春天，因为每一片叶子都是一朵花。",
  "要快乐，一定不要太关注别人。",
  "荒诞是清醒的人在这个无意义的世界上面对的唯一现实。",

  // --- 中国古诗词/文学 (Chinese Literature) ---
  "醉后不知天在水，满船清梦压星河。",
  "山中何所有，岭上多白云。只可自怡悦，不堪持赠君。",
  "且将新火试新茶，诗酒趁年华。",
  "我看青山多妩媚，料青山见我应如是。",
  "人生天地间，忽如远行客。",
  "浮云一别后，流水十年间。",
  "此时相望不相闻，愿逐月华流照君。",
  "林深时见鹿，海蓝时见鲸。",
  "桃李春风一杯酒，江湖夜雨十年灯。",
  "世事一场大梦，人生几度秋凉。",
  "粗缯大布裹生涯，腹有诗书气自华。",
  "莫听穿林打叶声，何妨吟啸且徐行。",
  "休对故人思故国，且将新火试新茶。",
  "行到水穷处，坐看云起时。",
  "大鹏一日同风起，扶摇直上九万里。",
  "愿我如星君如月，夜夜流光相皎洁。",
  "玲珑骰子安红豆，入骨相思知不知。",
  "曾经沧海难为水，除却巫山不是云。",
  "博观而约取，厚积而薄发。",
  "不乱于心，不困于情。不畏将来，不念过往。",
  "知我者，谓我心忧；不知我者，谓我何求。",
  "青青子衿，悠悠我心。",
  "星垂平野阔，月涌大江流。",
  "会当凌绝顶，一览众山小。",
  "人生若只如初见，何事秋风悲画扇。",
  "身无彩凤双飞翼，心有灵犀一点通。",
  "今夕何夕，见此良人。",
  "海内存知己，天涯若比邻。",
  "落霞与孤鹜齐飞，秋水共长天一色。",
  "老骥伏枥，志在千里。",
  "路漫漫其修远兮，吾将上下而求索。",
  "亦余心之所善兮，虽九死其犹未悔。",
  "苟利国家生死以，岂因祸福避趋之。",
  "天行健，君子以自强不息。",
  "地势坤，君子以厚德载物。",
  "众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。",
  "昨夜西风凋碧树，独上高楼，望尽天涯路。",
  "衣带渐宽终不悔，为伊消得人憔悴。",
  "大漠孤烟直，长河落日圆。",
  "举杯邀明月，对影成三人。",
  "长风破浪会有时，直挂云帆济沧海。",
  "两情若是久长时，又岂在朝朝暮暮。",
  "生当作人杰，死亦为鬼雄。",
  "采菊东篱下，悠然见南山。",
  "本来无一物，何处惹尘埃。",
  "一花一世界，一叶一菩提。",
  "流水不腐，户枢不蠹。",
  "知足不辱，知止不殆。",
  "上善若水，水利万物而不争。",
  "道可道，非常道；名可名，非常名。",

  // --- 西方文学/哲学 (Western Literature/Philosophy) ---
  "我们仰望同一片星空，却看着不同的地方。",
  "世界上只有一种英雄主义，那就是认清生活的真相后依然热爱生活。",
  "给时光以生命，而不是给生命以时光。",
  "只要想起一生中后悔的事，梅花便落满了南山。",
  "满地都是六便士，他却抬头看见了月亮。",
  "这里埋葬着图特卡蒙，他活过，爱过，死过。",
  "一个人知道自己为什么而活，就可以忍受任何一种生活。",
  "你千万别跟任何人谈任何事情。你只要一谈起，就会想念起每一个人来。",
  "我愿意深深地扎入生活，吮尽生活的骨髓。",
  "生命中曾经有过的所有灿烂，终究都需要用寂寞来偿还。",
  "万物皆有裂痕，那是光照进来的地方。",
  "人是一根会思考的芦苇。",
  "未经审视的人生是不值得过的。",
  "凡是过往，皆为序章。",
  "这是一个最好的时代，也是一个最坏的时代。",
  "冬天来了，春天还会远吗？",
  "不要温和地走进那个良夜。",
  "他人即地狱。",
  "存在先于本质。",
  "在这个世界上，除了思想，没有什么是真正自由的。",
  "智慧的起点是惊奇。",
  "认识你自己。",
  "我思故我在。",
  "爱是恒久忍耐，又有恩慈。",
  "你若盛开，蝴蝶自来。",
  "每一种色彩都应该盛开。",
  "我们终其一生，就是要摆脱他人的期待，找到真正的自己。",
  "你必须是你自己世界里的英雄。",
  "那些杀不死你的，终将使你更强大。",
  "上帝死了。",
  "凝视深渊过久，深渊将回以凝视。",
  "人类的悲欢并不相通，我只觉得他们吵闹。",
  "我在人间凑数，也在此处修仙。",
  "生活在别处。",
  "生命之轻，轻如鸿毛。",
  "我们都是阴沟里的虫子，但总还是得有人仰望星空。",
  "生存还是毁灭，这是一个问题。",
  "世界是一本书，不旅行的人只读了其中一页。",
  "真正的发现之旅不在于寻找新大陆，而在于拥有新视角。",

  // --- 技术与极客 (Tech & Geek) ---
  "Code is poetry.",
  "Talk is cheap. Show me the code.",
  "Stay hungry. Stay foolish.",
  "Simplicity is the ultimate sophistication.",
  "Hello, World.",
  "It's not a bug, it's a feature.",
  "The best way to predict the future is to invent it.",
  "Software is eating the world.",
  "Don't repeat yourself.",
  "Keep it simple, stupid.",
  "Programs must be written for people to read, and only incidentally for machines to execute.",
  "Truth can only be found in one place: the code.",
  "Real programmers count from 0.",
  "There is no place like 127.0.0.1.",
  "A journey of a thousand miles begins with a single step, or a single line of code.",
  "Experience is the name everyone gives to their mistakes.",
  "Computers are fast; developers keep them slow.",
  "First, solve the problem. Then, write the code.",
  "Good code documents itself.",
  "In open source, we feel strongly that to really do something well, you have to get a lot of people involved.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Premature optimization is the root of all evil.",
  "Make it work, make it right, make it fast.",
  "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",

  // --- 电影/歌词/流行 (Movies/Lyrics/Pop) ---
  "生活不止眼前的苟且，还有诗和远方的田野。",
  "每一个不曾起舞的日子，都是对生命的辜负。",
  "所谓无底深渊，下去，也是前程万里。",
  "你的负担将变成礼物，你受的苦将照亮你的路。",
  "生如夏花之绚烂，死如秋叶之静美。",
  "岁月漫长，值得等待。",
  "心之所向，素履以往。",
  "如果你为错过太阳而流泪，那么你也要错过群星了。",
  "世界吻我以痛，要我报之以歌。",
  "念念不忘，必有回响。",
  "愿你出走半生，归来仍是少年。",
  "世间所有的相遇，都是久别重逢。",
  "听过很多道理，依然过不好这一生。",
  "梦想还是要有的，万一实现了呢？",
  "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
  "能力越大，责任越大。",
  "愿原力与你同在。",
  "我命由我不由天。",
  "风陵渡口初相遇，一见杨过误终身。",
  "如果这世界上真有奇迹，那只是努力的另一个名字。",
  "有些鸟儿是关不住的，它们的羽毛太鲜亮了。",
  "不要忘记，不要忘记，不要忘记。",
  "你的名字，是我见过最短的情诗。",
  "我想要带你去浪漫的土耳其，然后一起去东京和巴黎。",
  "是谁来自山川湖海，却囿于昼夜厨房与爱。",
  "原谅我这一生不羁放纵爱自由。",
  "没有什么能够阻挡，我对自由的向往。",
  "曾梦想仗剑走天涯，看一看世界的繁华。",
  "生活不止眼前的苟且，还有诗和远方的田野。",
  "既然选择了远方，便只顾风雨兼程。",
  "面朝大海，春暖花开。",
  "黑夜给了我黑色的眼睛，我却用它寻找光明。",
  "卑鄙是卑鄙者的通行证，高尚是高尚者的墓志铭。",
  "世界上最遥远的距离，不是生与死，而是我就站在你面前，你却不知道我爱你。",
  "你站在桥上看风景，看风景的人在楼上看你。",
  "我挥一挥衣袖，不带走一片云彩。",
  "悄悄是别离的笙箫，夏虫也为我沉默。",
  "满载一船星辉，在星辉斑斓里放歌。",
  "那一年，花开得不是最好，可是还好，我遇到你。",
  "最好的时光，是彼此都在，却可以互不打扰。",
  "很多事情不能自己掌控，即使再孤单再寂寞，仍要继续走下去。",
  "人生最精彩的不是实现梦想的瞬间，而是坚持梦想的过程。",
  "唯有爱与美食不可辜负。",
  "好好虚度时光。",
  "你若安好，便是晴天。",
  "陪伴是最长情的告白。",
];

export function DailyQuote() {
  const [quote, setQuote] = useState("");
  const [cardWidth, setCardWidth] = useState(280);
  const [lightConeBottomWidth, setLightConeBottomWidth] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // 状态：存储分行后的结果
  const [quoteLines, setQuoteLines] = useState<string[]>([]);

  useEffect(() => {
    // 随机选择一句
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  // 智能分行逻辑：基于 Canvas 测量文本宽度，仅在超出容器宽度时分行
  useEffect(() => {
    if (!quote) return;

    const checkAndSplitQuote = () => {
      // 1. 获取当前容器允许的最大宽度
      // 对应 JSX 中的 style={{ maxWidth: 'min(82vw, 560px)' }}
      // 注意：这里需要考虑一定的安全边距，因为 Canvas 测量和 DOM 渲染可能有细微差异
      const maxContainerWidth = Math.min(window.innerWidth * 0.82, 560);

      // 2. 测量当前文本如果不换行的实际宽度
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        setQuoteLines([quote]);
        return;
      }

      // 设置字体参数需与 CSS 保持一致: text-xs (12px), font-medium (500), italic
      // 字体族尽量涵盖常见的系统字体，顺序参考 Tailwind 默认配置
      context.font = "italic 500 12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

      const textWidth = context.measureText(quote).width;

      // 3. 判断逻辑：宽松触发分行
      // 之前的阈值太严格 (maxContainerWidth - 10)，导致某些几乎填满一行的文本在浏览器中渲染时刚好溢出几个字
      // 从而产生了“孤儿行”且未触发我们的智能分行。
      // 现在的策略：如果文本宽度超过了容器宽度的 85%，或者距离满行不到 60px，就尝试去寻找更好的分行点，以求视觉平衡。
      const isTight = textWidth > maxContainerWidth - 60 || textWidth > maxContainerWidth * 0.85;

      if (!isTight) {
        setQuoteLines([quote]);
        return;
      }

      // 4. 需要分行：执行智能找分界点逻辑
      const punctuations = ['，', '。', '；', '：', '！', '？', '、', '…', '—', ',', '.', ';', ':', '!', '?'];
      const mid = quote.length / 2;
      let bestSplitIndex = -1;
      let minDistanceToMid = Infinity;

      // 4.1 优先寻找中间附近的标点符号
      for (let i = 0; i < quote.length; i++) {
        if (punctuations.includes(quote[i])) {
          const distance = Math.abs(i - mid);
          // 只有当标点在 25% - 75% 区域内才考虑，避免孤儿行
          if (distance < minDistanceToMid && i > quote.length * 0.25 && i < quote.length * 0.75) {
            minDistanceToMid = distance;
            bestSplitIndex = i;
          }
        }
      }

      // 4.2 如果没有合适的标点，尝试寻找中间附近的空格（针对英文）
      if (bestSplitIndex === -1) {
        const spaces = [' '];
        for (let i = 0; i < quote.length; i++) {
          if (spaces.includes(quote[i])) {
            const distance = Math.abs(i - mid);
            if (distance < minDistanceToMid && i > quote.length * 0.3 && i < quote.length * 0.7) {
              minDistanceToMid = distance;
              bestSplitIndex = i;
            }
          }
        }
      }

      // 5. 执行分行
      if (bestSplitIndex !== -1) {
        // 找到了理想的标点或空格分割点
        setQuoteLines([
          quote.slice(0, bestSplitIndex + 1),
          quote.slice(bestSplitIndex + 1).trim()
        ]);
      } else {
        // 6. 兜底策略：如果没有找到合适的分割点（如长中文长句），强制在中间平衡分割
        // 防止出现第一行很满，第二行只有几个字的“孤儿行”

        let forcedSplitIndex = Math.floor(quote.length / 2);

        // 如果是英文（包含空格），尝试寻找离中间最近的空格，避免截断单词
        if (quote.includes(' ')) {
           let minSpaceDist = Infinity;
           let nearestSpaceIndex = -1;
           for (let i = 0; i < quote.length; i++) {
             if (quote[i] === ' ') {
               const dist = Math.abs(i - mid);
               if (dist < minSpaceDist) {
                 minSpaceDist = dist;
                 nearestSpaceIndex = i;
               }
             }
           }

           if (nearestSpaceIndex !== -1) {
             setQuoteLines([
                quote.slice(0, nearestSpaceIndex),
                quote.slice(nearestSpaceIndex + 1).trim()
             ]);
             return;
           }
        }

        // 纯中文或无空格长文，直接中间切开
        setQuoteLines([
          quote.slice(0, forcedSplitIndex),
          quote.slice(forcedSplitIndex).trim()
        ]);
      }
    };

    checkAndSplitQuote();
    window.addEventListener('resize', checkAndSplitQuote);
    return () => window.removeEventListener('resize', checkAndSplitQuote);
  }, [quote]);

  useEffect(() => {
    // 根据视口宽度计算光锥底部宽度
    const updateLightConeWidth = () => {
      const isMobile = window.innerWidth < 768;
      const bottomWidth = isMobile
        ? window.innerWidth * 1.6     // 手机端：130% 视口宽度
        : window.innerWidth * 0.8;    // PC端：50% 视口宽度
      setLightConeBottomWidth(bottomWidth);
    };

    updateLightConeWidth();
    window.addEventListener('resize', updateLightConeWidth);
    return () => window.removeEventListener('resize', updateLightConeWidth);
  }, []);


  useEffect(() => {
    // 使用 ResizeObserver 实时监听卡片宽度变化
    if (cardRef.current && quote) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (entry.contentBoxSize) {
            // 使用 contentBoxSize 获取更精确的宽度
            const width = entry.contentRect.width;
            setCardWidth(width);
          }
        }
      });

      resizeObserver.observe(cardRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [quote]);

  // 避免服务端渲染不匹配
  if (!quote) return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] mb-6 md:mb-8 opacity-0">
       <span className="text-xs">Loading...</span>
    </div>
  );

  return (
    <>
      {/* Quote Card */}
      <div
        ref={cardRef}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.03] dark:bg-black/40 border border-black/[0.05] dark:border-amber-200/40 mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-[100] dark:shadow-[0_0_20px_2px_rgba(251,191,36,0.3)] backdrop-blur-sm transition-all"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 dark:text-amber-300" />
        <span
          className="text-xs font-medium text-neutral-600 dark:text-amber-100/90 italic text-center leading-relaxed"
          style={{
            display: 'inline-block',
            width: 'fit-content',
            maxWidth: 'min(82vw, 560px)',
          }}
        >
          {quoteLines.map((line, i) => (
            <span key={i} style={{ display: 'block' }}>
              {line}
            </span>
          ))}
        </span>

        {/* Light Cone - Bottom width based on viewport, top matches card */}
        <div className="hidden dark:block absolute top-full left-1/2 -translate-x-1/2 pointer-events-none overflow-visible">
          {/* Soft cone with smooth edges and center-out animation */}
          <div
            style={{
              width: `${lightConeBottomWidth}px`,
              height: '280px',
              background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.18) 0%, rgba(251, 191, 36, 0.12) 25%, rgba(251, 191, 36, 0.06) 50%, rgba(251, 191, 36, 0.02) 75%, transparent 100%)',
              clipPath: (() => {
                // 计算光锥顶部（卡片宽度）相对于底部宽度的位置
                const topLeftPercent = lightConeBottomWidth > 0
                  ? ((lightConeBottomWidth - cardWidth) / 2) / lightConeBottomWidth * 100
                  : 0;
                const topRightPercent = 100 - topLeftPercent;
                return `polygon(${topLeftPercent}% 0%, 0% 100%, 100% 100%, ${topRightPercent}% 0%)`;
              })(),
              filter: 'blur(50px)',
              animation: 'lightSpread 2s ease-out 0.4s forwards',
              opacity: 0,
              transform: 'scale(0)',
              transformOrigin: 'top center',
              boxShadow: '0 0 60px 20px rgba(251, 191, 36, 0.08)',
            }}
          />

          {/* Extra soft edge glow for smoothness */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: `${lightConeBottomWidth * 0.7}px`,
              height: '240px',
              background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.06) 40%, transparent 100%)',
              filter: 'blur(35px)',
              animation: 'lightSpread 2s ease-out 0.4s forwards',
              opacity: 0,
              transform: 'scale(0)',
              transformOrigin: 'top center',
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes lightSpread {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          40% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
