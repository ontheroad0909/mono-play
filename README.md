# MONO / PLAY

> 실험적인 단색(Black & White) 셀룰러 오토마톤 플레이그라운드. 픽셀 미학과 갈무리체(Galmuri) 타이포그래피로 완성했습니다.

## 개요
MONO / PLAY는 캔버스 기반 “Game of Life” 변형을 흑백 픽셀 스타일로 표현한 인터랙티브 도구입니다. 브라우저만으로 실행되며, 고해상도 디스플레이에서도 선명한 결과를 제공합니다.

## 특징
- **순수 흑백 표현**: 그라디언트 없이 밝기 대비만으로 패턴을 드러냅니다.
- **픽셀 정렬 렌더링**: DPR(디스플레이 배율)을 감안해 셀 경계를 정수 좌표에 스냅, 미세한 격자 틈을 제거했습니다.
- **즉시 조작 패널**: 재생 속도(ms)와 랜덤 채움 비율(%)을 슬라이더로 즉각 조정할 수 있습니다.
- **접근성 배려**: 버튼/힌트에 ARIA 라벨을 부여하고 키보드 단축키를 제공하여 누구나 조작하기 쉽습니다.

## 실행 방법
로컬 웹 서버가 없어도 `index.html`을 브라우저로 열면 바로 사용할 수 있습니다. 정적 서버를 선호한다면 다음 예시처럼 실행하세요.

```bash
npx serve .
# 또는
python3 -m http.server
```

## 조작법
- `PLAY` / `PAUSE`: 애니메이션 재생 토글
- `RANDOM` 또는 단축키 `R`: 현재 밀도 설정에 맞춰 무작위 패턴 생성
- `CLEAR` 또는 단축키 `C`: 모든 셀 비우기
- 마우스 드래그: 셀 채우기, `Shift+드래그`: 셀 지우기
- 스페이스바: 재생 토글 (포커스 상태에 관계없이 동작)
- 터치 입력: 드래그로 채우기, 멀티 터치 제스처 차단(touch-action: none)

## 구성 요소
- `index.html`: 구조와 컨트롤 패널(재생 속도·랜덤 채움) 레이아웃
- `styles.css`: 흑백 테마, Galmuri 타이포그래피, 반응형 캔버스 레이아웃 정의
- `script.js`: 
  - 디스플레이 배율에 대응하는 캔버스 리사이즈 및 상태 보존
  - Game of Life 규칙 기반 셀 업데이트 루프 (requestAnimationFrame)
  - 더티 셀 기반 부분 렌더링으로 성능 최적화

## 배포 안내 (GitHub Pages)
1. 새 GitHub 저장소를 생성한 뒤 본 프로젝트 파일을 커밋/푸시합니다.
2. **Settings → Pages**에서 **Build and deployment** 항목을 `Deploy from a branch`로 선택합니다.
3. 브랜치 `main`, 디렉터리 `/ (root)`를 지정합니다.
4. 수 분 후 할당된 URL(`https://<username>.github.io/<repo>/`)에 접속해 결과를 확인합니다.

> ⚠️ Jekyll 처리를 막고 싶다면 `.nojekyll` 파일을 루트에 비워 둡니다.

## 커스터마이징 포인트
- 슬라이더 기본값: `index.html`에서 `input[type="range"]`의 `value` 속성 조정
- 초기 랜덤 밀도: `script.js`의 `randomize(getDensityFraction())` 호출부 수정
- 셀 크기 및 간격: `styles.css` 루트 변수 `--cell-size`, `--gap` 변경
- 타이포그래피: Galmuri 패밀리(`Galmuri11`, `Galmuri14`) 외 원하는 폰트로 대체 가능

## 라이선스
- **코드**: MIT License (`LICENSE` 참조)
- **폰트**: 갈무리체(Galmuri) — SIL Open Font License 1.1 (CDN을 통해 불러옴)
