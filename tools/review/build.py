import base64
T='tools/review/review-tpl.html'; s=open(T).read()
R='img/'; A='img/fx/'
files={'emblem-horde':R+'emblem-horde.webp','emblem-alliance':R+'emblem-alliance.webp'}
for k in ['bg-square','bg-hall','claws','iron-corner','gold-corner','ember1','ember2','ember3','ember4','ember5','ember6','smoke1','smoke2','orb1','orb2','orb3','star-m','star-l']: files[k]=R+'fx/'+k+'.webp'
for k in ['sp-star4-a','sp-star4-b','sp-star8','sp-star-tiny','sp-glitter-burst','sp-burst-big']: files[k]=A+k+'.webp'
uri=lambda p:'data:image/webp;base64,'+base64.b64encode(open(p,'rb').read()).decode()
s=s.replace('%%SPRITES%%',','.join(files)).replace('%%SPRITEDATA%%',''.join(f'<script type="text/plain" id="s-{k}">{uri(p)}</script>' for k,p in files.items()))
assert '%%' not in s; open('tools/review/review.html','w').write(s); print(len(s)//1024,'KB')
