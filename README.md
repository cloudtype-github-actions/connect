# Cloudtype Github Actions - Connect Repository

클라우드타입의 스코프에서 GitHub 리파지토리를 읽을 수 있도록 배포키(Deploy Key) 등 사전 작업을 실행합니다. 

`cloudtype-github-actions/connect@v1`



## 입력값(Inputs)

## `token`

**필수** 클라우드타입 API Key

## `ghtoken`

**필수** 배포키(Deploy Key)를 읽기/쓰기가 가능한 권한을 가진 GitHub 퍼스널 액세스 토큰.

## `repo`

GitHub 리파지토리 형식: `user/repo`. 기본값 현재 액션이 실행중인 리파지토리 `${{ github.repository }}`.

## `scope`

연결할 클라우드타입의 스코프. 사용자 혹은 팀 이름.

## `readOnly`

`true` 로 설정하면 배포키(Deploy Key)가 읽기전용으로 생성됩니다. 기본값 `false`



---

## 사용예제


```yaml
uses: cloudtype-github-actions/connect@v1
with:
  token: ${{ secrets.CLOUDTYPE_TOKEN }}
```


```yaml
uses: cloudtype-github-actions/connect@v1
with:
  token: ${{ secrets.CLOUDTYPE_TOKEN }}
  ghtoken: ${{ secrets.GITHUB_TOKEN }}
  repo: ${{ github.repository }}
  readOnly: true
```

