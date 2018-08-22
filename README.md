# Voxelcraft
An experiment to produce a minecraft like game in webGL and JavaScript.

## Why?

I've been a big fan of minecraft since I first discovered it ( sometime during the alpha ) and it's a game I've come back to many times. Although I tired of vanilla after a couple of years I was brought back by modded minecraft, and the huge amount of variety it offers. I've regularly revisted it every year or so since, to try the newest mods around. Recently I've started playing vanilla again, after the release of the "better together" update. While I loved the fact I could now play with my friends who don't own ultra gaming rigs I found things that definitely soured the experience for me. The weird mismatch between how things behave compared to the Java edition and the lack of modding.

Coming back to this project, this isn't just an attempt to create minecraft 2.0. It's not meant to compete, and I don't intend to ever monitize it. I wanted to make a 3D game to development my webGL abilities, and this was the sort of game I wanted to try. It has fun challenges and I know the structure of the game quite well. Also I'd like to explore what new things I can try, to make this a truly unique project. Although it will likely always be known as a "minecraft clone".

## Status
- Basic infinite procedural generation; including water, sand, dirt, stone, grass and trees
- Dynamic chunk loading/unloading and texture generation
- Basic deferred renderer written in webGL 2
- Transparency ( shading is partially broken due to deferred rendering )
- Moveable camera
- Basic camera collision and gravity
- Trees have no leaves ( leaves are heard due to chunk boundaries )
- Block placing and breaking ( can only place stone at the moment )
- Simple directional lighting

## TODO
- Improve character collision
- Generate leaves for trees
- Improved tree positioning
- Dynamic world illumination
- Simple directional world shadows
- Improve speed of chunk generation and rendering
- Probably return to forward shader, and implement a special shader for fluids
- Better world generation ( y scaled 3d perlin/simplex instead of heightmap )
- Sun rotation
- Inventory system
- Ore generation
- Dynamic world changes ( growth etc )
- [Fancy fog](http://www.iquilezles.org/www/articles/fog/fog.htm)

