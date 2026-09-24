export type IntegrationEntry={id:string;name:string;category:string;status:"oauth_ready"|"setup_required"|"coming_soon";freeActions:string[];paidActions:string[];creditCosts:Record<string,number>};
export const integrationCatalog:IntegrationEntry[]=[
{id:"youtube",name:"YouTube",category:"Video",status:"oauth_ready",freeActions:["AI drafts","SEO planning"],paidActions:["Publishing","Analytics sync","Automation"],creditCosts:{draft:1,publish:2,analytics:1,automation:2}},
{id:"facebook",name:"Facebook",category:"Social",status:"oauth_ready",freeActions:["Post drafts"],paidActions:["Publishing","Scheduling","Automation"],creditCosts:{draft:1,publish:2,schedule:2,automation:2}},
{id:"instagram",name:"Instagram",category:"Social",status:"oauth_ready",freeActions:["Caption/reel drafts"],paidActions:["Publishing","Scheduling","Automation"],creditCosts:{draft:1,publish:2,schedule:2,automation:2}},
{id:"tiktok",name:"TikTok",category:"Social",status:"oauth_ready",freeActions:["Script/caption drafts"],paidActions:["Publishing","Scheduling","Automation"],creditCosts:{draft:1,publish:2,schedule:2,automation:2}},
{id:"whatsapp",name:"WhatsApp Business",category:"Messaging",status:"setup_required",freeActions:["Message drafts"],paidActions:["Business messaging","Automation"],creditCosts:{draft:1,message:2,automation:2}},
{id:"linkedin",name:"LinkedIn",category:"Professional",status:"setup_required",freeActions:["Post drafts"],paidActions:["Publishing","Scheduling"],creditCosts:{draft:1,publish:2,schedule:2}},
{id:"shopify",name:"Shopify",category:"Commerce",status:"setup_required",freeActions:["Product copy"],paidActions:["Store automation"],creditCosts:{draft:1,automation:2}},
{id:"wordpress",name:"WordPress",category:"Publishing",status:"setup_required",freeActions:["Article drafts"],paidActions:["Publishing","Scheduling"],creditCosts:{draft:1,publish:2,schedule:2}},
{id:"google-business",name:"Google Business Profile",category:"Business",status:"setup_required",freeActions:["Post/review drafts"],paidActions:["Publishing","Scheduling"],creditCosts:{draft:1,publish:2,schedule:2}}
];
export const FREE_PLAN={hourlyChats:10,dailyChats:30,startingCredits:10,imageCredits:2};
