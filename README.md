# Wishpool - backend

Express.js로 만든 node서버에 RESTful API와 web socket을 만들고, 이를 Azure Ubuntu 18.04 VM에 배포하는 프로젝트입니다.

## Getting Started

로컬 환경에서 개발하기

### Prerequisites

* node: v12.1.0
* Mongo Atlas M0 tier(무료)

```
# Node.js설치 
# Mongo Atlas 
1) 접속 후 M0 tier가입 
2) DB생성
3) DB경로를 복사해서 프로젝트 백엔드소스의 schemas/index.js에서 

mongoose.connect(`mongodb+srv://<yourMongoDBInfo>`,

<yourMongoDBInfo> 부분을 바꿔준다.
4) Mongo Atlas에서 white list에서 이 DB를 이용할 PC의 ip를 다 추가해준다.
```

### Development(Local)

해당 프로젝트 fork한 후, dependency 설치

```
cd Wishpool_back
npm install
```
로컬에서 개발할 때는
* bin/www의 포트번호를 3000번으로 바꾸고,
* https credential관련 코드 주석처리하고,
* websocket 서버를 https로 만든 것은 주석처리하고 http로 만든것을 주석을 푼다.
* Wishpoop_front에서도 로컬 경로를 주석해제하고, 실제 VM의 경로(Public ip 혹은 도메인주소)를 주석처리 한다.
nodemon으로 서버구동하면, 파일변경이 있을 때마다 자동으로 node서버를 재시작해줘서 편리하게 개발할 수 있다.

```
#for development
nodemon start
```
* ```localhost:3000``` : api
* ```localhost:3001``` : web socket

## Deployment
### Prerequisites
* Azure에서 Ubuntu 18.04 VM을 만든다.
* VM설정에서 인바운드포트 ```3000```, ```3001```을 추가로 개방한다.
* VM에 접속할 putty를 설치한다.
만약 도메인을 구매하지 않고, SSL설정을 하지 않는다면,
로컬 개발 설정을 그대로 두고,
* Wishpool_front에서 로컬 경로를 주석처리하고, 만든 VM의 public ip를 넣어준다. (포트번호는 유지)

만약 도메인을 구매하고, SSL설정을 한다면, 다음의 문서를 참고하여 설정한다.
* https://docs.google.com/document/d/1P0t-45iBzoPQygmE_YyIpqa3dGf_pThunQtJa_GCDGc/edit

https설정이 완료되었으면,
* bin/www.js의 포트번호를 80번으로 바꾸고,
* https credential관련 코드 주석해제하고,
* websocket 서버를 https로 만든 것은 주석해제하고 http로 만든것을 주석을 처리한다.
* Wishpoop_front에서도 로컬 경로를 주석처리하고, 도메인주소를 입력 한다.
```
#for example
http://localhost:3000 => https://yourdomain.com #80번 포트는 생략가능하다
http://localhost:3001 => https://yourdomain.com:3001 #for web socket interaction
```
코드를 수정했으면, git으로 ```remote repository```에 올린다.
```
git add .
git commit -m "configuration for deployment"
git push <your repository name> <your branch name>     #example: git push origin master
```

putty를 켜고
자신 VM의 public ip혹은 도메인을 넣어 접속한다.
VM을 만들때 설정한 ```ID과 패스워드```로 로그인한다.
git으로 프로젝트를 클로닝한다.

```
git clone <cloning url>
```
노드 서버를 구동한다
```
cd Wishpool_back
npm start 
혹은 npm start &     #for a background processing, add & at the end
```

### putty가 꺼져도 서버를 항상 실행하기
```
npm install pm2
```

```pm2```는 root권한에서만 제대로 작동한다.

```
sudo su #root권한 얻기
<암호입력>
pm2 start bin/www       #Wishpool_back 디렉토리 안에서 입력
```

서버를 끄고 싶다면 
```
pm2 delete www          #역시 root권한에서 실행되어야 종료된다. 
```
