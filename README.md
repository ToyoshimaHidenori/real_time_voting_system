# real_time_votiong_system


## 環境構築
```npm install -g n```
または
```brew install node```

expressとsocket.ioを入れます
```npm install express```
```npm install socket.io```

## 起動方法
直下のディレクトリで以下のコマンドを実行
```node server```

ブラウザを立ち上げて、投票者は、
localhost:7000,　管理者兼発表者は、
localhost:7000/admin
にアクセス。

## 使用の流れ
- はじめに、投票者は団体名と、配布された団体番号を入力。

- 発表者が、被投票者名を送信すると、自動的に投票が始まる。

- 投票者は、投票を行い送信すると、承認、否認が決定した時点でそれを表示。

- 発表者が、次の被投票者名を送信すると、自動的に次の投票に移る。