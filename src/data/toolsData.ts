import { ToolItem } from '../types';

export const TOOLS_DATA: ToolItem[] = [
  // 1. Organize
  {
    id: 'merge',
    title: 'PDF 병합',
    shortDesc: '여러 개의 PDF 문서를 원하는 순서대로 하나의 파일로 합칩니다.',
    category: 'organize',
    iconName: 'Combine',
    popular: true,
  },
  {
    id: 'split',
    title: 'PDF 분할',
    shortDesc: '원하는 페이지 범위만 지정하여 추출하거나 여러 파일로 나눕니다.',
    category: 'organize',
    iconName: 'Scissors',
    popular: true,
  },
  {
    id: 'organize',
    title: '페이지 정리',
    shortDesc: '페이지 순서를 마우스로 재배열하거나 회전 및 삭제합니다.',
    category: 'organize',
    iconName: 'LayoutGrid',
    popular: true,
  },
  {
    id: 'remove',
    title: '페이지 삭제',
    shortDesc: '불필요한 페이지만 골라서 즉시 제거한 새 문서를 만듭니다.',
    category: 'organize',
    iconName: 'Trash2',
  },
  // 2. Optimize
  {
    id: 'compress',
    title: 'PDF 압축',
    shortDesc: '문서의 품질을 유지하면서 파일 크기를 획기적으로 줄입니다.',
    category: 'optimize',
    iconName: 'Minimize2',
    popular: true,
  },
  // 3. Convert
  {
    id: 'pdf-to-img',
    title: 'PDF to JPG',
    shortDesc: 'PDF의 각 페이지를 고화질 JPG 이미지로 변환해 저장합니다.',
    category: 'convert',
    iconName: 'Image',
    popular: true,
  },
  {
    id: 'img-to-pdf',
    title: 'JPG to PDF',
    shortDesc: 'JPG, PNG 이미지 파일들을 깔끔한 PDF 문서로 변환합니다.',
    category: 'convert',
    iconName: 'FileImage',
    popular: true,
  },
  {
    id: 'pdf-to-text',
    title: 'PDF to Text',
    shortDesc: 'PDF 문서 내의 텍스트 레이어를 순수 텍스트로 추출합니다.',
    category: 'convert',
    iconName: 'FileText',
  },
  // 4. Edit
  {
    id: 'rotate',
    title: 'PDF 회전',
    shortDesc: '모든 페이지 또는 짝수/홀수 페이지만 90°씩 원하는 각도로 회전합니다.',
    category: 'edit',
    iconName: 'RotateCw',
  },
  {
    id: 'page-numbers',
    title: '페이지 번호 추가',
    shortDesc: '원하는 위치, 글꼴 크기, 형식으로 페이지 번호를 일괄 삽입합니다.',
    category: 'edit',
    iconName: 'Hash',
  },
  {
    id: 'watermark',
    title: '워터마크 추가',
    shortDesc: '투명도, 각도, 위치를 조절하여 텍스트 워터마크를 각인합니다.',
    category: 'edit',
    iconName: 'Stamp',
  },
  {
    id: 'sign',
    title: '전자 서명 (Sign)',
    shortDesc: '자필 서명을 그리거나 날인하여 PDF 원하는 위치에 추가합니다.',
    category: 'edit',
    iconName: 'PenTool',
    badge: 'NEW',
    popular: true,
  },
  // 5. Security
  {
    id: 'protect',
    title: 'PDF 암호 설정',
    shortDesc: '비밀번호를 설정하여 인가되지 않은 열람을 방지합니다.',
    category: 'security',
    iconName: 'Lock',
  },
  {
    id: 'unlock',
    title: 'PDF 잠금 해제',
    shortDesc: '암호가 걸린 PDF의 비밀번호를 해제하여 자유롭게 편집합니다.',
    category: 'security',
    iconName: 'Unlock',
  },
];
