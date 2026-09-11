export type Platform={id:string;name:string;icon:string;group:string;status:"ready"|"connect";tools:string[]};
export const platforms:Platform[]=[
{id:"youtube",name:"YouTube",icon:"▶",group:"Video",status:"ready",tools:["Title & SEO","Description","Tags & keywords","Long-form script","Shorts hooks","Watch-time planner","Subscriber growth planner","Retention planner","Content calendar","Thumbnail brief","Analytics planner"]},
{id:"instagram",name:"Instagram",icon:"◎",group:"Social",status:"ready",tools:["Caption writer","Reel scripts","Hook generator","Hashtag ideas","Carousel copy","Content calendar","Growth planner","Bio optimizer","Post ideas"]},
{id:"tiktok",name:"TikTok",icon:"♪",group:"Social",status:"ready",tools:["Hook generator","Short scripts","Caption writer","Hashtag ideas","Retention planner","Watch-time analyzer","Follower growth planner","Trend-angle ideas","Content calendar"]},
{id:"facebook",name:"Facebook",icon:"f",group:"Social",status:"ready",tools:["Post writer","Reels scripts","Page bio","Caption writer","Hashtag ideas","Content calendar","Engagement ideas","Growth planner","Ad copy drafts"]},
{id:"linkedin",name:"LinkedIn",icon:"in",group:"Professional",status:"ready",tools:["Post writer","Thought-leadership posts","Profile bio","Company page copy","Carousel copy","Content calendar","Lead-magnet copy","Engagement prompts"]},
{id:"shopify",name:"Shopify",icon:"◇",group:"Commerce",status:"connect",tools:["Product descriptions","SEO titles","Meta descriptions","Collection copy","Product FAQs","Ad copy drafts","Email copy","Store content plan","Product content refresh"]},
{id:"pinterest",name:"Pinterest",icon:"P",group:"Social",status:"ready",tools:["Pin titles","Pin descriptions","Keyword ideas","Board descriptions","Content calendar","Idea pins copy"]},
{id:"x",name:"X",icon:"𝕏",group:"Social",status:"ready",tools:["Post writer","Thread planner","Hook generator","Bio optimizer","Content calendar","Engagement prompts"]},
{id:"threads",name:"Threads",icon:"@",group:"Social",status:"ready",tools:["Post writer","Conversation hooks","Reply ideas","Content calendar","Growth planner"]},
{id:"reddit",name:"Reddit",icon:"R",group:"Community",status:"ready",tools:["Post drafts","Title ideas","Discussion prompts","Community-safe copy","Content planner"]},
{id:"telegram",name:"Telegram",icon:"➤",group:"Messaging",status:"ready",tools:["Channel posts","Announcement copy","Content calendar","CTA generator"]},
{id:"whatsapp",name:"WhatsApp Business",icon:"◉",group:"Messaging",status:"connect",tools:["Business message drafts","Broadcast copy","Catalog copy","CTA generator"]},
{id:"medium",name:"Medium",icon:"M",group:"Publishing",status:"ready",tools:["Article outlines","Article drafts","Titles","SEO summaries","Content calendar"]},
{id:"wordpress",name:"WordPress",icon:"W",group:"Publishing",status:"connect",tools:["Blog drafts","SEO titles","Meta descriptions","Content calendar","Update briefs"]},
{id:"google-business",name:"Google Business Profile",icon:"G",group:"Business",status:"connect",tools:["Post drafts","Offer copy","Update copy","Review-response drafts","Local content ideas"]},
{id:"email",name:"Email Marketing",icon:"✉",group:"Marketing",status:"ready",tools:["Campaign copy","Subject lines","Welcome sequence","Newsletter drafts","CTA ideas","Content calendar"]},
{id:"blog",name:"Blog & SEO",icon:"✎",group:"Publishing",status:"ready",tools:["Topic research brief","Outline","Article draft","SEO title","Meta description","Internal-link ideas","Content refresh"]},
];
export const toolCategories=[
{id:"growth",name:"Growth & Analytics",desc:"Plan real audience growth without artificial views or followers.",tools:["YouTube Watch-Time Planner","YouTube Subscriber Planner","TikTok Watch-Time Analyzer","Follower Growth Calculator","Retention & Completion Planner","Cross-platform Content Calendar"]},
{id:"content",name:"Content Studio",desc:"Turn one idea into platform-ready content.",tools:["Long-form scripts","Short-form scripts","Hooks","Captions","Posts","Threads","Carousels","Content repurposing"]},
{id:"seo",name:"SEO & Discovery",desc:"Improve discoverability with useful, platform-specific copy.",tools:["Titles","Descriptions","Keywords","Tags","Hashtag ideas","Meta descriptions","Product SEO"]},
{id:"commerce",name:"Commerce",desc:"Create and improve ecommerce content.",tools:["Product descriptions","Product titles","Collection copy","Store content","Ad copy drafts","Email copy","Product FAQs"]},
{id:"visual",name:"Visual Studio",desc:"Create thumbnails, banners and social visuals.",tools:["YouTube thumbnails","Social posts","Reel covers","Channel banners","Product visuals","Brand graphics"]},
{id:"business",name:"Business & Marketing",desc:"Support brands and small businesses with repeatable content workflows.",tools:["Brand voice brief","Campaign planner","Email campaigns","Offer copy","Review-response drafts","Lead-magnet copy"]},
];
