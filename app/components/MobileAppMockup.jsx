'use client'

import React, { useState } from 'react'

export default function MobileAppMockup() {
  const [selectedBarber, setSelectedBarber] = useState(1)
  const [selectedService, setSelectedService] = useState(2)
  const [selectedDate, setSelectedDate] = useState('11')
  const [selectedTime, setSelectedTime] = useState('14:30')

  return (
    <div className="w-[280px] sm:w-[300px] h-[550px] rounded-[36px] border-[8px] border-zinc-800 bg-[#070708] p-3 shadow-2xl relative flex flex-col justify-between overflow-hidden group select-none">
      {/* iPhone Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-black rounded-full z-20 flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 ml-12" />
      </div>

      {/* Screen Background Glow */}
      <div className="absolute -left-12 -top-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Internal Content Container */}
      <div className="flex flex-col flex-1 mt-4 overflow-y-auto no-scrollbar justify-between text-left">
        {/* App Bar */}
        <div className="flex justify-between items-center mb-3.5 px-2">
          <div>
            <p className="text-[10px] text-zinc-500">Agendar em</p>
            <p className="text-xs font-bold text-white font-sans flex items-center gap-1">
              BarberShopBR <span className="text-[10px] text-amber-500">★ 4.9</span>
            </p>
          </div>
          <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
            ✉
          </span>
        </div>

        {/* 1. Select Professional */}
        <div className="mb-3.5 px-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Escolha o Profissional</p>
          <div className="flex gap-2">
            {[
              { id: 1, name: 'Thiago', role: 'Master' },
              { id: 2, name: 'Felipe', role: 'Barber' },
              { id: 3, name: 'Lucas', role: 'Barber' }
            ].map((barber) => (
              <button
                key={barber.id}
                onClick={() => setSelectedBarber(barber.id)}
                className={`flex-1 p-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                  selectedBarber === barber.id
                    ? 'border-amber-500/60 bg-amber-500/5 text-amber-500'
                    : 'border-zinc-900 bg-zinc-900/40 text-zinc-400'
                }`}
              >
                <div className="w-7 h-7 mx-auto rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-300 mb-1">
                  {barber.name.substring(0, 2)}
                </div>
                <p className="text-[10px] font-bold block">{barber.name}</p>
                <p className="text-[8px] text-zinc-500 block leading-none">{barber.role}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Services List */}
        <div className="mb-3.5 px-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Nossos Serviços</p>
          <div className="flex flex-col gap-1.5">
            {[
              { id: 1, name: 'Corte Degradê Premium', time: '40 min', price: 'R$ 55' },
              { id: 2, name: 'Barba Terapia e Toalha', time: '30 min', price: 'R$ 40' },
              { id: 3, name: 'Combo (Corte + Barba)', time: '75 min', price: 'R$ 85' }
            ].map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedService(srv.id)}
                className={`p-2 rounded-xl border flex justify-between items-center transition-all duration-200 cursor-pointer ${
                  selectedService === srv.id
                    ? 'border-amber-500/60 bg-amber-500/5'
                    : 'border-zinc-900 bg-zinc-900/20'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold ${selectedService === srv.id ? 'text-amber-500' : 'text-zinc-200'}`}>{srv.name}</p>
                  <p className="text-[8px] text-zinc-500">{srv.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white">{srv.price}</p>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedService === srv.id ? 'border-amber-500 bg-amber-500' : 'border-zinc-800'}`}>
                    {selectedService === srv.id && <span className="w-1.5 h-1.5 bg-black rounded-full" />}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Date Row */}
        <div className="mb-3.5 px-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Selecione o Dia</p>
          <div className="flex gap-2 justify-between">
            {[
              { day: 'Seg', date: '10' },
              { day: 'Ter', date: '11' },
              { day: 'Qua', date: '12' },
              { day: 'Qui', date: '13' },
              { day: 'Sex', date: '14' }
            ].map((d) => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex-1 py-1 px-0.5 rounded-lg text-center transition-all duration-200 cursor-pointer ${
                  selectedDate === d.date
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-zinc-900/40 text-zinc-400'
                }`}
              >
                <p className="text-[8px] uppercase block">{d.day}</p>
                <p className="text-xs block font-bold mt-0.5">{d.date}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Time Grid */}
        <div className="mb-4 px-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Horários Disponíveis</p>
          <div className="grid grid-cols-4 gap-1.5">
            {['09:00', '10:30', '14:30', '16:00', '17:30', '19:00'].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-1 text-[9px] rounded-lg border text-center transition-all duration-200 cursor-pointer ${
                  selectedTime === time
                    ? 'border-amber-500/80 bg-amber-500/10 text-amber-500 font-bold'
                    : 'border-zinc-900 bg-zinc-900/20 text-zinc-400'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <button className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 cursor-pointer mt-auto">
          Confirmar Agendamento
          <span className="text-[10px]">→</span>
        </button>
      </div>
    </div>
  )
}
