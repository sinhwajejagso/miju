from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/stock/*": {"origins": "*"}})

stock_configs = {
    'tsla': {'main': 'TSLA', 'related': ['TSLA', 'TSLL', 'TSLS']},
    'nvda': {'main': 'NVDA', 'related': ['NVDA', 'NVDU', 'NVDD']},
    'pltr': {'main': 'PLTR', 'related': ['PLTR']}
}

def get_stock_data(stock_id):
    config = stock_configs.get(stock_id.lower())
    if not config:
        return {"error": "Invalid stock ID"}
    
    main_ticker = config['main']
    related_tickers = config['related']
    
    main_stock = yf.Ticker(main_ticker)
    main_price = main_stock.info.get('regularMarketPrice', main_stock.info.get('currentPrice', 0))
    main_hist = main_stock.history(period="5d")
    chart_data = list(main_hist['Close'].values) if not main_hist.empty else []
    
    related_data = []
    for rel_ticker in related_tickers:
        rel_stock = yf.Ticker(rel_ticker)
        rel_price = rel_stock.info.get('regularMarketPrice', rel_stock.info.get('currentPrice', 0))
        rel_hist = rel_stock.history(period="2d")
        volume = rel_hist['Volume'].iloc[-1] if not rel_hist.empty else 0
        if len(rel_hist) > 1:
            volume_change = ((volume - rel_hist['Volume'].iloc[-2]) / rel_hist['Volume'].iloc[-2]) * 100
        else:
            volume_change = 0
        related_data.append({
            "type": rel_ticker if rel_ticker == main_ticker else ('leveraged' if rel_ticker.endswith('L') else 'inverse'),
            "price": rel_price,
            "volume": volume,
            "volumeChange": f"{volume_change:.1f}%" if volume_change else "N/A"
        })
    
    return {
        "price": main_price,
        "related": related_data,
        "chartData": chart_data
    }

@app.route('/stock/<stock_id>')
def stock_data(stock_id):
    data = get_stock_data(stock_id)
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True, port=5000)