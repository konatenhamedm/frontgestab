import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Erreur applicative interceptée par ErrorBoundary:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false })
    window.location.href = '/login'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-3">
            <h1 className="text-lg font-bold text-slate-900">Une erreur est survenue</h1>
            <p className="text-xs text-slate-500">
              La page n'a pas pu s'afficher correctement. Réessayez ou reconnectez-vous.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
