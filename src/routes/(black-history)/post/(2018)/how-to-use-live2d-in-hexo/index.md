---
title: 在 hexo 博客中使用 live2d
---

# 在 hexo 博客中使用 live2d

<script setup>
import VueMetadata from "@/components/metadata/Metadata.vue"
</script>

<vue-metadata author="swwind" time="2018-3-16" tags="hexo,live2d">
</vue-metadata>

你肯定已经在许多博客里看到过 live2d 的技术了吧。

他们基本上是使用 [pixi-live2d][pixi-live2d] 或者 [hexo-helper-live2d][hexo-helper-live2d] 插件的。

个人推荐使用 hexo-helper-live2d。

但是这个插件有一个缺点就是只能用现有的模型。

然而此时网络上的大部分模型都是打包过的 `.lpk` （Live2d Package）文件<span class="truth" title="你在想什么">，这样就不能愉快的换老婆了</span>。

然后我们发现用来打包成 `.lpk` 文件的是一个用 Java 写的小程序：[Live2DConfigGenerator][Live2DConfigGenerator]。

那么我们就试着用 [jad][jad] 来反编译一下。

我们先来观赏一下里面的文件目录

```
\---com
		+---google
		|   \---gson
		|       |   DefaultDateTypeAdapter.java
		|       |   ExclusionStrategy.java
		|       |   FieldAttributes.java
		|       |   FieldNamingPolicy.java
		|       |   FieldNamingStrategy.java
		|       |   Gson.java
		|       |   GsonBuilder.java
		|       |   InstanceCreator.java
		|       |   JsonArray.java
		|       |   JsonDeserializationContext.java
		|       |   JsonDeserializer.java
		|       |   JsonElement.java
		|       |   JsonIOException.java
		|       |   JsonNull.java
		|       |   JsonObject.java
		|       |   JsonParseException.java
		|       |   JsonParser.java
		|       |   JsonPrimitive.java
		|       |   JsonSerializationContext.java
		|       |   JsonSerializer.java
		|       |   JsonStreamParser.java
		|       |   JsonSyntaxException.java
		|       |   LongSerializationPolicy.java
		|       |   TreeTypeAdapter.java
		|       |   TypeAdapter.java
		|       |   TypeAdapterFactory.java
		|       |
		|       +---annotations
		|       |       Expose.java
		|       |       SerializedName.java
		|       |       Since.java
		|       |       Until.java
		|       |
		|       +---internal
		|       |   |   ConstructorConstructor.java
		|       |   |   Excluder.java
		|       |   |   JsonReaderInternalAccess.java
		|       |   |   LazilyParsedNumber.java
		|       |   |   LinkedTreeMap.java
		|       |   |   ObjectConstructor.java
		|       |   |   Primitives.java
		|       |   |   Streams.java
		|       |   |   UnsafeAllocator.java
		|       |   |
		|       |   \---bind
		|       |           ArrayTypeAdapter.java
		|       |           CollectionTypeAdapterFactory.java
		|       |           DateTypeAdapter.java
		|       |           JsonTreeReader.java
		|       |           JsonTreeWriter.java
		|       |           MapTypeAdapterFactory.java
		|       |           ObjectTypeAdapter.java
		|       |           ReflectiveTypeAdapterFactory.java
		|       |           SqlDateTypeAdapter.java
		|       |           TimeTypeAdapter.java
		|       |           TypeAdapterRuntimeTypeWrapper.java
		|       |           TypeAdapters.java
		|       |
		|       +---reflect
		|       |       TypeToken.java
		|       |
		|       \---stream
		|               JsonReader.java
		|               JsonScope.java
		|               JsonToken.java
		|               JsonWriter.java
		|               MalformedJsonException.java
		|
		\---oukaitou
				\---live2d
						|   ConfigDefine.java
						|   ConfigFileGenerator.java
						|   JsonConfigEntity.java
						|   JsonMainLveEntity.java
						|   LocationStrings.java
						|   LpkCreator.java
						|   MainLveFileGenerator.java
						|   MainWindow.java
						|
						+---utils
						|       ConfigFileNameFilter.java
						|       FileUtils.java
						|
						\---version
										AsunaGetter.java
										BattleGirlGetter.java
										BGGetter.java
										IVersionGetter.java
										TansakuGetter.java
										VersionDefine.java
										VersionFactory.java
```

> 以上文件树使用 `tree /f /a` 指令生成，有删改

乍一看是不是很多？

我们慢慢来分析。

首先可以看出，`com/google` 文件夹显然是一个复制过来的 api。
于是我们先从 `com/oukaito` 文件夹分析。

通过简单的推测，程序入口应该是 `com/oukaito/live2d/MainWindow.java`。
~~其实 jar 包里的 MANIFEST.MF 文件里就写着。~~

然后我们在其中找到了一个 `btnCreateLpkFileAction()` 函数，目测应该是用来生成 `.lpk` 文件的。

```java
private void btnCreateLpkFileAction() {
	File srcFile = new File(textPath.getText());
	if (srcFile == null || !srcFile.exists()) {
		JOptionPane.showMessageDialog(frmLivedConfigGenerator, "\u65E0\u6548\u6587\u4EF6\u8DEF\u5F84");
		return;
	}
	boolean success = LpkCreator.create(srcFile);
	if (success)
		lblInfo.setText("LPK\u6587\u4EF6\u521B\u5EFA\u6210\u529F");
	else
		lblInfo.setText("LPK\u6587\u4EF6\u521B\u5EFA\u5931\u8D25");
}
```

~~jad 反编译的局部变量名称怎么会这么正常？以前不是 abcd 枚举下去的么。。。~~

然后我们来看看 `LpkCreator.create(File)` 函数。

代码有点长，但是乍一看，我发现了什么：

```java
ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(output));
```

难道说整个 `.lpk` 文件就是一个 zip 压缩包？

改了一下后缀，右键解压，。。。。

好，现在我们已经得到了一个 Live2D 模型了。

让我们回到 hexo-helper-live2d 中来。

---

根据文档描述，使用 `$ npm install --save hexo-helper-live2d` 来安装插件。

> 你可以使用 [淘宝镜像][npm-taobao] 来加速下载。
> 或者 [使用本地代理][socks5]
>
> [npm-taobao]: https://npm.taobao.org/
> [socks5]: https://segmentfault.com/a/1190000002589144

将模型解压出来后，你将会看到两个 `.mlve` 文件和一个单独的文件夹。
我们先假设这个单独的文件夹叫做 `sagiri`。

在博客根目录上新建一个 `live2d_models` 文件夹，并将 `sagiri` 文件夹复制进去。

接着打开博客的配置文件，加入以下内容

```yaml
live2d:
  enable: true
  scriptFrom: local
  model:
    use: sagiri # 但是我永远喜欢 シュヴィ・ドーラ
  display:
    position: right
    width: 150
    height: 300
  mobile:
    show: true
```

然后打开本地端口，你就可以看到你老婆啦！

也许你会需要更多的配置以及说明，具体请参见 [官方文档][hexo-helper-live2d-docs]。

最后安利一款软件。

Steam 上的 [Live2DViewerEX](https://store.steampowered.com/app/616720/Live2DViewerEX/) 以及 [创意工坊](https://steamcommunity.com/app/616720/workshop/)。

[pixi-live2d]: https://github.com/avgjs/pixi-live2d
[hexo-helper-live2d]: https://github.com/EYHN/hexo-helper-live2d
[Live2DConfigGenerator]: https://steamcommunity.com/sharedfiles/filedetails/?id=966461146
[jad]: https://varaneckas.com/jad/
[hexo-helper-live2d-docs]: https://github.com/EYHN/hexo-helper-live2d/blob/master/README.zh-CN.md
