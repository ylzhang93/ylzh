# 欧拉恒等式：五个数的聚会

> 这是一篇示例文章，演示博客的写作方式。看完后可以删除：`posts/2026-08-30-euler-identity.md`，并更新 `posts/index.json`。

欧拉恒等式把数学里五个最著名的常数聚在一起：

$$
e^{i\pi} + 1 = 0
$$

其中 $e$ 是自然对数的底，$i$ 是虚数单位，$\pi$ 是圆周率。它们的相遇来自指数函数的幂级数展开。对任意实数 $x$，

$$
e^{ix} = \cos x + i\sin x
$$

代入 $x = \pi$，便得到 $\cos\pi = -1$ 与 $\sin\pi = 0$。

## 一点注记

- 也有人把它写成 $e^{i\pi} = -1$，这省略了 $0$ 与 $1$。
- 恒等式在复分析中几乎是平凡的，却常被当作「数学之美」的象征。
- 若用 Taylor 级数直接展开 $e^{i\theta}$，也可以得到同样的结论：

```python
import cmath
# e^(i*pi) 在浮点意义下约等于 -1
print(cmath.exp(1j * cmath.pi))   # (-1+1.2246467991473532e-16j)
```

> 形式如 $x_i$、$a_{ij}$ 的下标同样可以直接书写，KaTeX 会自动排版。

## AoPS 风格

也支持 AoPS 论坛式的标签：行内公式 [math]a^2 + b^2 = c^2[/math]，块级公式

[math]
\det
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix} = ad - bc
[/math]

---

欧拉在 1748 年的 *Introductio in analysin infinitorum* 中给出了这一公式。据说高斯曾说，如果一个人不能立刻看出这个式子的意义，他就永远成不了第一流的数学家。
