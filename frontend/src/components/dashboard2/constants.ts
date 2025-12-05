import { User, Prediction, Activity, FeaturedItem, PredictionItem, Player } from "./types";

export const CURRENT_USER: User = {
  id: "u1",
  name: "Username",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBYPWwpeFNJOf-Upj2T8HPmF8UnxXOcXUP1axTS2m7cj2HIfAlDafXsuZdj1qgcCKuS5XRnACPZPkS88loGxJTYd0cKxsZy2jdimbFI-mhGIIidxG8aKjMKgrM_zpiCCMn4rONqG-FTcRVm29fRdJSUJZkJOfSwr1s33FXMiVGZrEhPQVLe1wgYvOXwRD76DAyUDsLgcZdnDPvO-tQr0hoDp-YgeUy-1F0omGesa5uplzXTywTp8u7IQwhupVWPppdGfTrM0aB5EQjC",
  rank: 42,
  kp: 1250,
  title: "Master Predictor",
};

export const PREDICTIONS: Prediction[] = [
  {
    id: "p1",
    title: "AFCON 2025 Winner",
    userPrediction: "Nigeria",
    potentialWinnings: 500,
    progress: 25,
    closingIn: "22d",
    status: "Active",
  },
  {
    id: "p2",
    title: "Next Burna Boy Album Release",
    userPrediction: "Q4 2024",
    potentialWinnings: 150,
    progress: 70,
    closingIn: "10d",
    status: "Active",
  },
  {
    id: "p3",
    title: "Artist of the Year: Headies 2024",
    userPrediction: "Asake",
    potentialWinnings: 200,
    progress: 90,
    closingIn: "4d",
    status: "Active",
  },
];

export const LEAGUE_MEMBERS: User[] = [
  {
    id: "u2",
    name: "Adebayo",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCp3cVq3iJD5Wv4c1vKZ0gWWK8nPSC8nBASM7BXs35_-bLpHwedarvPC9ZO9_ijxzD5H-rStGseS4yC8YLil8Dkv-sqyjmJMkxI2bhH17lLzSvA_IFLeQz0c8lUf5vf-38_jrc7D2QTpPF6d6nwZHwBwAe5QW2zKqbTtwaxeN-aSGKeldmfYwgVjpJJCnbXYIN7ExrdVV-dTOLrgpUVEk5VjHVnWp1LNSiwuQJYrxtnZAdkcehP0RSV7g20Pp_B9PqJZjQLPmwr96Cr",
    rank: 41,
    kp: 1280,
  },
  {
    id: "u1",
    name: "You",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCaM_6mgV8iGSOaOwkpfqf3huebARhNRqQPt-ryGEQbDY4q8EyUqOPFTli6TLLI1ABY7gYTwbKBXJ8ytikjbxpP3NUn5Ir2cfbK4pmd6_bohBlE-pZ-nGQA4qDRlxDAVxq_0_lZwXt24EnDt3mGDfqbDf3bLPVo1FwPwbyE44A94Y_B37CqiZWDEBjeZ3A99B3Vns8wVKt6z6VdB47rARQs2TgKg0saUGcyfd8T3_jhk5aqltXRg3RgrMTInUkX6DN-nqazEc9dQYzu",
    rank: 42,
    kp: 1250,
  },
  {
    id: "u3",
    name: "Chidinma",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDL0litn12EEh-08Bt3OzEpVulUd1EmyGgoiOOrwHg3Vd8l2LTWnRt_p2q0mBdkAwgoMudSwB8X5172_xrcPONwbM-IwcKyMYy-EfbC_4x_YY1kc1FiKRpyuVg8g6NML8e-SxuObIZdDKMVVxQH-bVNzY0QkojgZ8HlAr5hM89cG-5DCJmokP8lmT4M6yRgpnHo8zaQwMCQqRwVSHOqQh0nl5aVyN3nhtZOOQigltLfN4pQzlMD6pVJ03jZrpJStokwNjjSWQK5M5KX",
    rank: 43,
    kp: 1225,
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: "a1",
    user: {
      id: "u4",
      name: "Funke",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDLx5gUSg94qDp9Zza4RzhYsQps9SnoOWIgkOA5x5Eo4QmTr7Fl_3rbcpyDVD7iOCwV-LkpI_cI7tTAHRNmJqE7fjWNqxaFoxpVD4_irAOhPoTLX3zGQ0KJYbphKuBWQaELhwoDRGZIPVP2nbYciZcko-dIDl8UmUQMuaTi3kd8IfDzWFg6gMNG5l9jIEo3SzWosDRBdQIPgRHcY2dh8D083JbZboZryJeqF5TsH3Rr0QuIlaFYGbVJi8gWvn95vsL_DAnS6_paFY8K",
      rank: 100,
      kp: 900,
    },
    action: "predicted in",
    target: "Nollywood's Next Big Hit",
    timestamp: "5m ago",
    type: "prediction",
  },
  {
    id: "a2",
    user: {
      id: "u2",
      name: "Adebayo",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBk4fwsyvFoLiDJPsZO1pCiMZaFV2i_Fjq6zu-7qRw52zqNO6dfyfGLVdp0_gHQ2z5SoEDW6sIwyJ9pThD8frqA72k8pg0JzWHad-LQ0LiBpMf9AcY1EBlzf_-0xQPDHUDnpVSsPNe3F_RC0wrjUhrJOXtLQMZFzLoI0qQ-eAjCKk2Kn4PH5XrkhEjvG7zOaQf020n-d6QVoP0UeH8oHQvEcguQ1jxtdR6IUJ8RS-vkqAbJ6zVEVtWJNB_cVzJOTAd7Iv6OT_UXdDLB",
      rank: 41,
      kp: 1280,
    },
    action: "just joined the",
    target: "Lagos Tech Scene",
    timestamp: "2h ago",
    type: "join",
  },
  {
    id: "a3",
    user: {
      id: "u3",
      name: "Chidinma",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDIUGLALNAbLdY6KkwNrT9nZVzU5mpuDsUi0BVR8EIDYErgsf0OVsbzugvl3LLmehwlojJBtoSOiJrhNEjml2M-hnDYsBJ0fBRQglfS_ybSbfm7NDxClzSFiGPbE6U6Ma40xmgz_3fwFx4E2nNHnz1LQ87OGgV7LoBvRB0zWW0BEx07HndyRshRObqBE7U3koqvHeKRkqtuDX-WLCpmDjnngN82uNTFzUgkgAYU4bYUCcnPWRlygoivh6dqi8aYvZ_h2DxG50yVOGML",
      rank: 43,
      kp: 1225,
    },
    action: "gained",
    highlight: "50 KP",
    target: "from the AFCON Qualifiers event",
    timestamp: "1d ago",
    type: "gain",
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  AfroBeats: "accent-magenta",
  Nollywood: "primary",
  Sports: "accent-teal",
  Fashion: "accent-magenta",
  Culture: "primary",
};

export const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: "f1",
    title: "Who headlines Detty December?",
    subtitle: "Predict the ultimate holiday headliner",
    imageUrl:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "f2",
    title: "Nollywood’s next breakout hit",
    subtitle: "Pick the movie that takes over 2025",
    imageUrl:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "f3",
    title: "AFCON qualifier shocker?",
    subtitle: "Back your instincts on the next upset",
    imageUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop",
  },
];

export const PREDICTION_FEED: PredictionItem[] = [
  {
    id: "pf1",
    title: "Burna Boy drops a surprise single",
    imageUrl:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop",
    category: "AfroBeats",
    endsIn: "3d 12h",
    poolAmount: 12450,
  },
  {
    id: "pf2",
    title: "Super Eagles clean sheet next game",
    imageUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop",
    category: "Sports",
    endsIn: "1d 2h",
    poolAmount: 9870,
  },
  {
    id: "pf3",
    title: "Top Nollywood film crosses ₦1B",
    imageUrl:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1600&auto=format&fit=crop",
    category: "Nollywood",
    endsIn: "6d 20h",
    poolAmount: 20300,
  },
  {
    id: "pf4",
    title: "Afro-fashion collab trend peaks Q1",
    imageUrl:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1600&auto=format&fit=crop",
    category: "Fashion",
    endsIn: "4d 7h",
    poolAmount: 8120,
  },
];

export const LEADERBOARD_PLAYERS: Player[] = [
  {
    rank: 1,
    name: "Adebayo",
    points: 24560,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1600&auto=format&fit=crop",
    trend: 2,
  },
  {
    rank: 2,
    name: "Chidinma",
    points: 22640,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop",
  },
  {
    rank: 3,
    name: "You",
    points: 19880,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCaM_6mgV8iGSOaOwkpfqf3huebARhNRqQPt-ryGEQbDY4q8EyUqOPFTli6TLLI1ABY7gYTwbKBXJ8ytikjbxpP3NUn5Ir2cfbK4pmd6_bohBlE-pZ-nGQA4qDRlxDAVxq_0_lZwXt24EnDt3mGDfqbDf3bLPVo1FwPwbyE44A94Y_B37CqiZWDEBjeZ3A99B3Vns8wVKt6z6VdB47rARQs2TgKg0saUGcyfd8T3_jhk5aqltXRg3RgrMTInUkX6DN-nqazEc9dQYzu",
    isCurrentUser: true,
    trend: 5,
  },
  {
    rank: 4,
    name: "Funke",
    points: 17620,
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1600&auto=format&fit=crop",
  },
  {
    rank: 5,
    name: "Kofi",
    points: 15400,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1600&auto=format&fit=crop",
    trend: 1,
  },
];


