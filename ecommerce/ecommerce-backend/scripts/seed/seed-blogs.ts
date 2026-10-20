import { db } from '../../src/database';
import { blogs } from '../../src/features/blog/shared/blog.schema';
import { logger } from '../../src/utils/logging/logger';
import { uuidv7 } from 'uuidv7';
import { eq } from 'drizzle-orm';
import { loadEnv } from '../../src/utils/config/load-env';

loadEnv();

const PRE_DEFINED_BLOGS = [
  {
    title: 'Mastering the Game: A Beginner’s Guide to Carrom',
    slug: 'beginners-guide-to-carrom',
    quote:
      'The secret to winning at carrom is not just skill, but understanding the board, the angles, and the art of patience.',
    description:
      'Discover the basic rules, techniques, and tips to start your carrom journey and dominate the board.',
    content: `
      <h2>The Origins of Carrom</h2>
      <p>Carrom is a tabletop game of Indian origin that has fascinated players for generations. Known for its blend of strategy, precision, and skill, the game brings people together, whether for casual family fun or intense competitive tournaments.</p>
      
      <h2>Getting Started: The Rules</h2>
      <p>The standard carrom board features a smooth wooden surface with four corner pockets. The objective is to use a heavier 'striker' to flick lighter 'carrom men' (black and white coins) into the pockets. A designated red coin, known as the 'Queen', holds the highest value and must be pocketed and 'covered' by another carrom man.</p>
      
      <h2>Essential Beginner Tips</h2>
      <ul>
        <li><strong>Stance and Grip:</strong> Finding a comfortable grip for the striker is crucial. The most common grips are the 'straight grip' and the 'scissors grip'. Experiment to see what works best for you.</li>
        <li><strong>Understanding Angles:</strong> Carrom is often compared to billiards. Understanding how the striker will bounce off the edges (the rebound) is key to making difficult shots.</li>
        <li><strong>Using Carrom Powder:</strong> A good quality carrom powder reduces friction, allowing the striker and coins to glide effortlessly. Don't overlook this essential accessory!</li>
      </ul>
      
      <h2>Choosing Your First Board</h2>
      <p>For beginners, we recommend starting with a standard training board. As your skills progress, you can upgrade to a club series or a professional tournament board for higher speed and precision.</p>
    `,
    main_image_pc_url:
      'https://images.unsplash.com/photo-1574923203787-ee36eef07c71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY2Fycm9tJTIwYm9hcmQlMjB3b29kZW58ZW58MXx8fHwxNzcwMTk5MjM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    main_image_mobile_url:
      'https://images.unsplash.com/photo-1574923203787-ee36eef07c71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY2Fycm9tJTIwYm9hcmQlMjB3b29kZW58ZW58MXx8fHwxNzcwMTk5MjM3fDA&ixlib=rb-4.1.0&q=80&w=800',
    category: 'Guides',
    tags: ['Beginner', 'Tips', 'Carrom Rules'],
    author: 'Admin',
    meta_title: 'Beginner’s Guide to Carrom | Rules & Tips',
    meta_description:
      'Learn how to play carrom with our comprehensive beginner’s guide. Discover rules, techniques, and board maintenance tips.',
    status: 'public' as const,
  },
  {
    title: 'Top 5 Carrom Strategies Used by Professionals',
    slug: 'top-5-carrom-strategies',
    quote:
      'Professionals don’t just play the board; they play their opponent. Strategic positioning is half the battle won.',
    description:
      'Elevate your gameplay with these advanced carrom strategies straight from the tournament circuit.',
    content: `
      <h2>Beyond the Basics</h2>
      <p>Once you've mastered the basic strikes and pockets, it's time to elevate your gameplay. Professional carrom players utilize a combination of physics, psychological warfare, and incredible precision to outsmart their opponents.</p>
      
      <h2>1. The Break Shot</h2>
      <p>A powerful and well-positioned break shot can determine the flow of the entire game. Aim slightly off-center to scatter the coins while keeping your own pieces in favorable positions.</p>
      
      <h2>2. Blocking the Opponent</h2>
      <p>If you don't have a clear shot, don't just take a wild swing. Use your turn to lightly tap one of your coins to block your opponent's access to their pieces or a pocket. Defensive play is critical in professional matches.</p>
      
      <h2>3. The Rebound Shot (Board Shot)</h2>
      <p>Direct shots aren't always available. Mastering the rebound off the wooden frame allows you to target coins hidden behind clusters. Calculate the angle of incidence and reflection.</p>
      
      <h2>4. Board Management</h2>
      <p>Always clear coins from the center first. Coins near the edge are generally easier to pocket later, whereas center coins can obstruct your cross-board shots.</p>
      
      <h2>5. Securing the Queen</h2>
      <p>Timing is everything when it comes to the Queen. Don't pocket it unless you are absolutely certain you have an easy cover shot lined up. Conversely, if your opponent is close to finishing, pocketing the Queen with a difficult cover might be a necessary risk.</p>
    `,
    main_image_pc_url:
      'https://images.unsplash.com/photo-1699743570117-91384b4b0400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3VybmFtZW50JTIwY2Fycm9tJTIwYm9hcmQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMTk5MjM5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    main_image_mobile_url:
      'https://images.unsplash.com/photo-1699743570117-91384b4b0400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3VybmFtZW50JTIwY2Fycm9tJTIwYm9hcmQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMTk5MjM5fDA&ixlib=rb-4.1.0&q=80&w=800',
    category: 'Strategy',
    tags: ['Advanced', 'Pro Tips', 'Tournaments'],
    author: 'Admin',
    meta_title: 'Top 5 Carrom Strategies Used by Professionals',
    meta_description:
      'Elevate your carrom skills with our top 5 advanced strategies. Learn blocking, rebound shots, and expert board management.',
    status: 'public' as const,
  },
  {
    title: 'How to Maintain Your Carrom Board for Maximum Longevity',
    slug: 'carrom-board-maintenance-guide',
    quote:
      'A well-maintained board doesn’t just last longer; it guarantees a fair, fast, and competitive game every single time.',
    description:
      'Protect your investment with our definitive guide to carrom board cleaning, storage, and maintenance.',
    content: `
      <h2>The Importance of Maintenance</h2>
      <p>A premium carrom board is a significant investment. Wood is sensitive to temperature, humidity, and physical wear. Proper maintenance ensures that your board remains warp-free and the playing surface retains its low-friction, glass-like smoothness.</p>
      
      <h2>Routine Cleaning</h2>
      <p>After every gaming session, use a soft, dry microfiber cloth to wipe down the playing surface. This removes dead skin cells, oils, and excess powder that can accumulate and create sticky spots.</p>
      
      <h2>Using the Right Powder</h2>
      <p>Never use talcum powder or boric acid indiscriminately. Stick to high-quality, specialized disco carrom powder. It's formulated to minimize abrasion. Apply sparingly—too much powder can actually clump and slow down the coins.</p>
      
      <h2>Storage Best Practices</h2>
      <ul>
        <li><strong>Keep it Flat:</strong> Always store your carrom board horizontally on a flat surface. Leaning it against a wall vertically for extended periods can cause the wood frame to warp.</li>
        <li><strong>Climate Control:</strong> Keep the board away from direct sunlight, heating vents, and damp areas. Extreme temperatures and humidity are wood's worst enemies.</li>
        <li><strong>Use a Cover:</strong> Invest in a heavy-duty padded cover to protect against dust, accidental spills, and scratches when not in use.</li>
      </ul>
      
      <h2>Periodic Polishing</h2>
      <p>Depending on usage, a light polishing of the wooden frame (not the playing surface!) with a quality wood polish every few months will keep the board looking pristine.</p>
    `,
    main_image_pc_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    main_image_mobile_url:
      'https://images.unsplash.com/photo-1767619834318-63184920c4b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb20lMjBzdHJpa2VyJTIwY29pbnMlMjBwbGF5aW5nfGVufDF8fHx8MTc3MDE5OTIzOHww&ixlib=rb-4.1.0&q=80&w=800',
    category: 'Maintenance',
    tags: ['Care', 'Equipment', 'Guide'],
    author: 'Admin',
    meta_title: 'Carrom Board Maintenance Guide | Tips & Tricks',
    meta_description:
      'Learn how to properly clean, store, and maintain your wooden carrom board to ensure longevity and a smooth playing surface.',
    status: 'public' as const,
  },
];

async function seedBlogs() {
  logger.info('🌱 Seeding blogs...');

  try {
    for (const b of PRE_DEFINED_BLOGS) {
      const blogId = uuidv7();
      logger.info(`Creating blog: ${b.title} (${blogId})`);

      // Check if exists by slug
      const [existing] = await db.select().from(blogs).where(eq(blogs.slug, b.slug));
      if (existing) {
        logger.info(`Blog ${b.slug} already exists, skipping...`);
        continue;
      }

      await db.insert(blogs).values({
        id: blogId,
        title: b.title,
        slug: b.slug,
        quote: b.quote,
        description: b.description,
        content: b.content,
        main_image_pc_url: b.main_image_pc_url,
        main_image_mobile_url: b.main_image_mobile_url,
        category: b.category,
        tags: b.tags,
        author: b.author,
        meta_title: b.meta_title,
        meta_description: b.meta_description,
        status: b.status,
        published_at: new Date(),
        views_count: Math.floor(Math.random() * 500) + 50, // Some random initial views
        is_deleted: false,
      });
    }

    logger.info('✨ Blog seeding completed!');
    setTimeout(() => process.exit(0), 500);
  } catch (error) {
    logger.error('❌ Error seeding blogs:', error);
    setTimeout(() => process.exit(1), 500);
  }
}

seedBlogs();
