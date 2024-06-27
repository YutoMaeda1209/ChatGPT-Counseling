# ChatGPT-Counseling

## 動作環境
- MacOS Sonoma 14.5
- Nodejs 10.5.2

## セットアップ
1. ターミナルで、`nano ~/.zshrc`を実行
2. `export OPENAI_API_KEY='your-api-key-here'`を入力（`your-api-key-here`を自分のOpenAI APIキーに書き換える）
3. Ctrl+Oを押し、保存
4. `source ~/.zshrc`を実行してプロファイルを更新
5. `echo $OPENAI_API_KEY`を実行して正常に環境変数が設定されていることを確認する

## LICENSE
MIT License

Copyright © 2020 Yuto Maeda

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
