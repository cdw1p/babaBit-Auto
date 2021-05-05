const fetch = require('node-fetch')
const moment = require('moment')
const fs = require('fs-extra')
const faker = require('faker')
const cronJob = require('cron').CronJob
const { Twisters } = require('twisters')
const twisters = new Twisters()
require('colors')

let logMessage, logInfo, randomIP, totalSuccess = 0, totalError = 0, timeoutTimer = 10000

function getString(start, end, all) {
  const regex = new RegExp(`${start}(.*?)${end}`)
  const result = regex.exec(all)
  return result
}

function functionRandomIP() {
  randomIP = (Math.floor(Math.random() * 255) + 1) + '.' + (Math.floor(Math.random() * 255)) + '.' + (Math.floor(Math.random() * 255)) + '.' + (Math.floor(Math.random() * 255))
}

function randNumber(length) {
  const result = []
  const characters = '0123456789'
  for ( var i = 0; i < length; i++ ) result.push(characters.charAt(Math.floor(Math.random() *  characters.length)))
  return result.join('')
}

function randString(length) {
  const result = []
  const characters = '012345678910abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for ( var i = 0; i < length; i++ ) result.push(characters.charAt(Math.floor(Math.random() *  characters.length)))
  return result.join('')
}

const functionRegisterUsers = (email, inviteCode) => new Promise((resolve, reject) => {
  fetch(`https://m.bababit.com/api`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'DNT': '1',
      'Accept-Language': 'zh_CN',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua': '\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Mobile Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://m.bababit.com',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': `https://m.bababit.com/registered?inviteCode=${inviteCode}&language=en_US`,
      'X-Forwarded-For': randomIP,
      'X-ProxyUser-Ip': randomIP
    },
    body: `code=630093&json=%7B%22systemCode%22%3Anull%2C%22companyCode%22%3Anull%2C%22token%22%3Anull%2C%22language%22%3A%22en_US%22%2C%22email%22%3A%22${encodeURIComponent(email)}%22%2C%22bizType%22%3A%22805046%22%7D`
  })
  .then(res => res.json())
  .then(text => resolve(text))
  .catch(err => reject(err))
})

const functionVerifyUsers = (email, password, inviteCode, otpCode) => new Promise((resolve, reject) => {
  fetch(`https://m.bababit.com/api`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'DNT': '1',
      'Accept-Language': 'zh_CN',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua': '\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Mobile Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://m.bababit.com',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': `https://m.bababit.com/registered?inviteCode=${inviteCode}&language=en_US`,
      'X-Forwarded-For': randomIP,
      'X-ProxyUser-Ip': randomIP
    },
    body: `code=805046&json=%7B%22systemCode%22%3Anull%2C%22companyCode%22%3Anull%2C%22token%22%3Anull%2C%22language%22%3A%22en_US%22%2C%22email%22%3A%22${encodeURIComponent(email)}%22%2C%22captcha%22%3A%22${otpCode}%22%2C%22loginPwd%22%3A%22${password}%22%2C%22inviteCode%22%3A%22SHzmat%22%7D`,
  })
  .then(res => res.json())
  .then(text => resolve(text))
  .catch(err => reject(err))
})

const functionGetLink = (email, domain) => new Promise((resolve, reject) => {
  const listDomain = ['emailfake.com', 'generator.email']
  fetch(`https://${listDomain[Math.floor(Math.random() * listDomain.length)]}/${domain}/${email}`, {
    method: 'GET',
    timeout: timeoutTimer,
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'accept-encoding': 'gzip, deflate, br',
      'cookie': `_ga=GA1.2.659238676.1567004853; _gid=GA1.2.273162863.1569757277; embx=%5B%22${email}%40${domain}%22%2C%22hcycl%40nongzaa.tk%22%5D; _gat=1; io=io=tIcarRGNgwqgtn40O${randString(3)}; surl=${domain}%2F${email}`,
      'upgrade-insecure-requests': 1,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
      'X-Forwarded-For': randomIP,
      'X-ProxyUser-Ip': randomIP
    }
  })
  .then(res => res.text())
  .then(text => {
    const data = getString('verification code is ', ', valid', text)
    resolve(data ? data[1] : data)
  })
  .catch(err => reject(err))
})

const functionMain = () => new Promise(async (resolve, reject) => {
  // Loop Process
  for (loopProcess = 0; ; loopProcess++) {
    try {
      // Initialize Users Info
      const usersDomains = ['dikitin.com', 'triadstore.eu.org', 'sightmedia.us', 'halonews.us', 'dalnet.uk.to', 'traz.cafe', 'wix.my.id', 'redrive.my.id', 'domtix.ru', 'torprojectorg.ru', 'hotmail.red', 'gmailup.com', 'indozoom.net', 'gmailya.com', 'gmailwe.com']
      const usersFname = await faker.name.firstName().replace(/\W|_/gi, '')
      const usersLname = await faker.name.lastName().replace(/\W|_/gi, '')
      const usersFullname = `${usersFname}${usersLname}${randNumber(5)}`
      const usersDomain = usersDomains[Math.floor(Math.random() * usersDomains.length)]
      const usersEmail = `${usersFullname}@${usersDomain}`.toLowerCase()
      const usersPassword = 'WasdWuyq7HCaXT'
      const usersReferral = 'SHzmat'
      logInfo = `- Email : ${usersEmail}\n- Fullname : ${usersFname} ${usersLname}\n- Referral Code : ${usersReferral}\n- Total Success : ${`${totalSuccess}`.green.bold}`

      // Registration Users
      logMessage = `[${moment().format('HH:mm:ss')}] Trying to Register New Users...`
      const resRegisterUsers = await functionRegisterUsers(usersEmail, usersReferral)
      if (resRegisterUsers.isSuccess) {
        // Verify New Email
        logMessage = `[${moment().format('HH:mm:ss')}] Trying to Verify Email Verification...`
        let resLinkConfirmation, resVerifyUsers, countLC = 0, countVU = 0
        do {
          resLinkConfirmation = await functionGetLink(usersFullname, usersDomain)
          countLC = countLC + 1
          if (countLC >= 10) break
        } while (!resLinkConfirmation)
        do {
          resVerifyUsers = await functionVerifyUsers(usersEmail, usersPassword, usersReferral, resLinkConfirmation)
          countVU = countVU + 1
          if (countVU >= 10) break
        } while (!resVerifyUsers)

        // Statement Success or Not
        if (resVerifyUsers.data.userId) {
          const { userId, nickname, token } = resVerifyUsers.data
          logMessage = `[${moment().format('HH:mm:ss')}] Verify Email Verification Success !`

          // Output
          totalSuccess = totalSuccess + 1
          await fs.appendFileSync(`./acc_saved_${moment().format('DD_MM_YY')}.txt`, `${usersEmail}|${usersPassword}|${userId}|${nickname}|${token}\n`)
        } else {
          logMessage = `[${moment().format('HH:mm:ss')}] Verify Email Verification Failed !`
          totalError = totalError + 1
        }
      } else {
        return
      }
    } catch (err) {
      twisters.put('loading', { text: `[${moment().format('HH:mm:ss')}] Error : ${err.message}`.red.bold })
      totalError = totalError + 1
    }
  }
})

;(async () => {
  // CronJob
  functionMain()
  new cronJob('*/1 * * * *', function () { functionMain() }, null, true, 'Asia/Jakarta').start()
  new cronJob('* * * * * *', async function() {
    await functionRandomIP()
    // Log Output
    twisters.put('loading', { text: `${`${logMessage}`.yellow.bold}\n${logInfo}` })
  }, null, true, 'Asia/Jakarta').start()
})()