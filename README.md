# Cloudtype Github Actions - Connect Repository

This action sets up the repository to pull the code when deployed.

`cloudtype-github-actions/connect@v1`



## Inputs

## `token`

**Required** Cloudtype Access Token.

## `ghtoken`

GitHub Personal access token used to read & write repository deploy key. Default `${{ github.token }}`.

## `repo`

Github repository name `user/repo`. Default `${{ github.repository }}`.

## `scope`

Cloudtype scope to connect with `repo` repository.

## `readOnly`

Set it to `true` if you want to create a read-only deploy key. Default `false`



---

## Example usage


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

