export const supportResourceIntro =
  "익명의 편지는 즉각적인 위험이나 위기 상황을 대체할 수 없습니다. 이 지원 자료는 신뢰할 수 있는 외부 전문 기관 목록입니다.";

export const highRiskSupportCopy =
  "편지가 또래 응답자에게 전달되지 않았습니다. 현재 힘든 상황이라면 곁에 있는 신뢰할 수 있는 사람이나 아래의 전문 지원 기관에 손을 내밀어주세요.";

export type CrisisHotline = {
  id: string;
  title: string;
  subtitle: string;
  number: string;
  tel: string;
  region: "KR" | "CN";
  regionLabel: string;
  hours: string;
  description: string;
  isPrimary?: boolean;
};

export const DEFAULT_CRISIS_HOTLINES: CrisisHotline[] = [
  // Republic of Korea
  {
    id: "kr-109",
    title: "24시 자살예방 상담전화",
    subtitle: "대한민국 통합 위기상담 핫라인",
    number: "109",
    tel: "109",
    region: "KR",
    regionLabel: "대한민국",
    hours: "24시간 365일 연중무휴",
    description: "전문 상담사가 언제나 귀를 기울이고 있습니다. 국번없이 109, 통화료 무료.",
    isPrimary: true
  },
  {
    id: "kr-1393",
    title: "보건복지상담센터",
    subtitle: "자살예방 및 심리적 위기 상담",
    number: "1393",
    tel: "1393",
    region: "KR",
    regionLabel: "대한민국",
    hours: "24시간 365일 운영",
    description: "보건복지부 자살예방 및 심리적 위기 긴급 상담. 국번없이 1393, 통화료 무료."
  },
  {
    id: "kr-1577-0199",
    title: "정신건강 위기상담전화",
    subtitle: "광역 및 기초 정신건강복지센터 연계",
    number: "1577-0199",
    tel: "1577-0199",
    region: "KR",
    regionLabel: "대한민국",
    hours: "24시간 전문상담",
    description: "극심한 불안, 우울, 심리적 공황 상태의 위기 개입 및 심층 상담."
  },
  {
    id: "kr-1388",
    title: "청소년 상담전화 1388",
    subtitle: "청소년 및 보호자 전용 핫라인",
    number: "1388",
    tel: "1388",
    region: "KR",
    regionLabel: "대한민국",
    hours: "24시간 연중무휴",
    description: "청소년의 고민, 학업 스트레스, 가정 및 교우 관계 긴급 상담."
  },
  // Mainland China
  {
    id: "cn-400",
    title: "全国心理危机干预热线",
    subtitle: "全国免费心理危机咨询与援助",
    number: "400-161-9995",
    tel: "4001619995",
    region: "CN",
    regionLabel: "中国大陆",
    hours: "24小时专业援助",
    description: "全国免费心理危机干预及自杀预防生命热线，提供即时专业心理疏导与危机干预。",
    isPrimary: true
  },
  {
    id: "cn-12355",
    title: "共青团青少年心理援助热线 12355",
    subtitle: "全国统一青少年权益与心理热线",
    number: "12355",
    tel: "12355",
    region: "CN",
    regionLabel: "中国大陆",
    hours: "全国24小时工作制",
    description: "面向青少年及家长的全国专业心理援助热线，倾听困惑并提供紧急心理支持。"
  },
  {
    id: "cn-010",
    title: "北京心理危机研究与干预中心",
    subtitle: "回龙观医院全国热线",
    number: "010-82951332",
    tel: "01082951332",
    region: "CN",
    regionLabel: "中国大陆",
    hours: "24小时免费热线",
    description: "中国权威自杀干预与心理危机救助热线，资深临床心理专家提供在线援助。"
  }
];
