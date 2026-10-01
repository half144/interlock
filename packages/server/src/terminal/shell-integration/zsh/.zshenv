typeset -g INTERLOCK_SHELL_INTEGRATION_DIR="${${(%):-%N}:A:h}"

if [[ -n "${INTERLOCK_ZSH_ZDOTDIR-}" ]]; then
  export ZDOTDIR="${INTERLOCK_ZSH_ZDOTDIR}"
else
  unset ZDOTDIR
fi

if [[ -n "${ZDOTDIR-}" ]]; then
  if [[ -f "${ZDOTDIR}/.zshenv" ]]; then
    source "${ZDOTDIR}/.zshenv"
  fi
elif [[ -f "${HOME}/.zshenv" ]]; then
  source "${HOME}/.zshenv"
fi

source "${INTERLOCK_SHELL_INTEGRATION_DIR}/paseo-integration.zsh"
