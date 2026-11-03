const names = [
'阿米娅','维什戴尔','能天使','银灰','艾雅法拉','史尔特尔','浊心斯卡蒂','缄默德克萨斯','逻各斯','玛恩纳','锏','黍',
'耀骑士临光','假日威龙陈','归溟幽灵鲨','令','夕','年','重岳','灰烬','艾拉','火龙S黑角','麒麟R夜刀',
'拉普兰德','蓝毒','白金','陨星','临光','可颂','雷蛇','赫默','华法琳','白面鸮','幽灵鲨','崖心','初雪','诗怀雅','德克萨斯','凛冬','红','槐琥','送葬人','普罗旺斯','夜魔','天火',
'蛇屠箱','古米','角峰','讯使','清道夫','白雪','流星','杰西卡','远山','夜烟','苏苏洛','嘉维尔','末药','调香师','砾','阿消','暗索','慕斯','猎蜂','地灵','深海色',
'芬','香草','玫兰莎','卡缇','米格鲁','克洛丝','安德切尔','炎熔','史都华德','安赛尔','芙蓉','斑点','泡普卡','月见夜','空爆',
'夜刀','黑角','巡林者','杜林','12F'
];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
for (const name of names) {
  const u = 'https://prts.wiki/api.php?action=query&format=json&list=allimages&aiprefix=' + encodeURIComponent('半身像_' + name + '_') + '&ailimit=50';
  const j = await (await fetch(u, {headers:{'user-agent':'Mozilla/5.0'}})).json();
  const files = (j.query?.allimages || []).map(x => x.name);
  const normal = files.filter(f => f.endsWith('_1.png') && !f.includes('skin'));
  console.log(name + '\t' + (normal[0] || files[0] || 'MISSING'));
  await sleep(80);
}
