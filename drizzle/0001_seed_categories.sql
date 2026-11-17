-- PRD F5 초기 카테고리 (기본값)
INSERT INTO "categories" ("name", "description") VALUES
  ('모델/연구', '새로운 AI 모델, 논문, 연구 성과'),
  ('제품 출시', 'AI 제품·서비스·기능 출시 및 업데이트'),
  ('투자/비즈니스', '투자 유치, 인수합병, 기업 전략, 실적'),
  ('정책/규제', '정부 정책, 법률, 규제, 소송'),
  ('기타', '위 카테고리에 해당하지 않는 뉴스')
ON CONFLICT ("name") DO NOTHING;
